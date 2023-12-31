import FamilyData, { AuthType, Node, ParentDataType, RegisterType, RelationType, StatusVerifyUser, statusTemporaryFamily } from "../types/family.type"
import { createClient } from "@supabase/supabase-js";
import { Gender } from "relatives-tree/lib/types";
import { v4 as uuidv4 } from "uuid";
import moment from 'moment-timezone';

export const supabase = createClient(process.env.REACT_APP_SUPABASE_HOST || "", process.env.REACT_APP_SUPABASE_KEY || "");

const tableName = 'family'
const tableNameTemporary = 'temporary_family'

class FamilyDataService {
  async getAll(): Promise<Node[] | any> {
    const { data, error }: any = await supabase
      .from(tableName)
      .select('tree')
      .single()

    if (error) {
      throw error
    } else if (data) {
      return this.mappingData(data.tree)
    }
  }

  async update(familyData: FamilyData[]) {
    const date = moment().tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');
    const { data, error } = await supabase
      .from(tableName)
      .update({ tree: familyData, updated_at: date })
      .eq('id', 1)

    if (error) {
      throw error
    } else if (data) {
      return data
    }
  }

  async getById(id: any) {
    return this.getAll().then(data => data.filter((dataFirst: any) => dataFirst.id === id)[0])
  }

  async getIndexById(id: string) {
    return this.getAll().then(data => data.findIndex((index: any) => index.id === id))
  }

  async getLengthData() {
    return this.getAll().then(data => { return data.length })
  }

  mappingData(familyData: FamilyData[]) {

    return familyData.map((data) => {
      const defaultNode: any = {
        children: [],
        gender: "",
        id: "",
        parents: [],
        siblings: [],
        spouses: [],
        birthday: "",
        address: "",
        job: "",
        photo: "",
        description: ""
      };

      const mappedData = {
        ...defaultNode,
        ...data,
      };
      return mappedData;
    });
  }

  async createSuperadminUser() {
    const { count } = await supabase
      .from('profile')
      .select('*', { count: 'exact', head: true })

    if (count === 0) {
      const { data: dataAuth, error: authError } = await supabase.auth.signUp({
        email: process.env.REACT_APP_ADMIN_EMAIL || "",
        password: "admin123"
      })

      if (authError) {
        throw authError
      } else if (dataAuth) {
        const userId = dataAuth?.user?.id
        const { data: dataProfile, error: insertError } = await supabase.from('profile').insert({
          id: userId,
          role_id: 1,
          name: "Administrator"
        })
        if (insertError) {
          throw insertError
        } else if (dataProfile) {
          return dataProfile
        }
      }
    }
  }

  async getProfileById(userId: string) {
    const { data, error } = await supabase.from('profile').select('*').eq('id', userId).single()

    if (error) {
      throw error
    } else if (data) {
      return data
    }
  }

  async userSignUp({ email, password, name, fatherId, motherId }: RegisterType) {
    const { data: dataAuth, error: authError } = await supabase.auth.signUp({ email, password })
    if (authError) {
      throw authError
    } else if (dataAuth) {
      const userId = dataAuth?.user?.id
      const { data: dataProfile, error: insertError } = await supabase.from('profile').insert({
        id: userId,
        role_id: 2,
        name,
        father_id: fatherId,
        mother_id: motherId,
        is_verify: StatusVerifyUser.pending
      })
      if (insertError) {
        throw insertError
      } else if (dataProfile) {
        return dataProfile
      }
    }
  }

  async userSignIn({ email, password }: AuthType) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error
    } else if (data) {
      return data
    }
  }

  async getAllListRequestFamily() {
    const { data, error } = await supabase.from(tableNameTemporary).select('*');

    if (error) {
      throw error
    } else if (data) {
      return data
    }
  }

  async getListRequestUsers() {
    const { data, error } = await supabase.from('profile').select('*').neq('role_id', 1)

    if (error) {
      throw error
    } else if (data) {
      const result = await Promise.all(
        data.map(async (res) => {
          const getFatherData = await this.getById(res.father_id)
          const getMotherData = await this.getById(res.mother_id)
          return {
            id: res.id,
            name: res.name,
            fatherName: getFatherData.name,
            motherName: getMotherData.name,
            status: res.is_verify,
            createdAt: res.created_at
          }
        })
      )
      return result
    }
  }

  async approvedUser(id: string) {
    const { data, error } = await supabase.from('profile')
      .update({ is_verify: StatusVerifyUser.approve })
      .eq('id', id)

    if (error) {
      throw error
    } else if (data) {
      return data
    }
  }

  async rejectedUser(id: string) {
    const { data, error } = await supabase.from('profile')
      .update({ is_verify: StatusVerifyUser.rejected })
      .eq('id', id)

    if (error) {
      throw error
    } else if (data) {
      return data
    }
  }

  async getSearchOneline(searchId: string, childrenData?: null | string) {
    const data = await this.getById(searchId)

    let result: any = [];
    let formatData = {
      id: data.id,
      name: data.name,
      parents: data.parents,
      gender: data.gender,
      children: [],
      spouses: []
    }

    if (childrenData) {
      formatData.children = data.children.filter((filter: any) => filter.id === childrenData)
    }

    result.push(formatData);
    for (const parent of data.parents) {
      const parentData = await this.getSearchOneline(parent.id, searchId);
      result.push(...parentData);
    }

    return result
  }

  // TEMPORARY FAMILY / REQUEST FAMILY
  async storeTemporaryFamilyData(parentData: ParentDataType, relation_type: RelationType, familyData: FamilyData) {
    const { data, error } = await supabase.from(tableNameTemporary).insert({
      parent_id: parentData.parentId,
      parent_name: parentData.parentName,
      relation_type,
      data: familyData,
      status: statusTemporaryFamily.pending
    })

    if (error) {
      throw error
    } else if (data) {
      return true
    }
  }

  async updateRequestFamily(requestId: number, status: statusTemporaryFamily) {
    const { data, error } = await supabase
      .from(tableNameTemporary)
      .update({ status })
      .eq('id', requestId)

    if (error) {
      throw error
    } else if (data) {
      return true
    }
  }

  async getAllFatherData() {
    return this.getAll().then(data => data.filter((dataFirst: any) => dataFirst.gender === Gender.male))
  }

  async getSpouseByHusbandId(husbandId: string) {
    const dataHusband = await this.getById(husbandId)
    const wifeOfHusband = dataHusband.spouses
    let finalData: any = []
    await Promise.all(
      wifeOfHusband.map(async (data: Node, index: number) => {
        const getData = await this.getById(data.id)
        finalData[index] = {
          id: index,
          label: getData.name,
          parentId: getData.id
        }
        return finalData
      })
    )

    return finalData
  }

  //STORAGE
  async uploadImage(file: File) {
    const fileName = uuidv4()
    await supabase
      .storage.from(tableName)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      })

    const { data } = supabase
      .storage
      .from(tableName)
      .getPublicUrl(fileName)

    return data.publicUrl
  }
}

export default FamilyDataService;