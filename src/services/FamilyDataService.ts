import FamilyData, { AuthType, Node, ParentDataType, RelationType, statusTemporaryFamily } from "../types/family.type"
import { createClient } from "@supabase/supabase-js";
import { Gender } from "relatives-tree/lib/types";
import { v4 as uuidv4 } from "uuid";

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
    const { data, error } = await supabase
      .from(tableName)
      .update({ tree: familyData })
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
        photo: ""
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

  async userSignUp({ email, password }: AuthType) {
    const { data: dataAuth, error: authError } = await supabase.auth.signUp({ email, password })
    if (authError) {
      throw authError
    } else if (dataAuth) {
      const userId = dataAuth?.user?.id
      const { data: dataProfile, error: insertError } = await supabase.from('profile').insert({
        id: userId,
        role_id: 2,
        name: ""
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