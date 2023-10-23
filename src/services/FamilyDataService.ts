import FamilyData, { Node } from "../types/family.type"
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

export const supabase = createClient(process.env.REACT_APP_SUPABASE_HOST || "", process.env.REACT_APP_SUPABASE_KEY || "");

const tableName = 'family'

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
    const { error } = await supabase
      .from(tableName)
      .update({ tree: familyData })
      .eq('id', 1)
    return error
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

  // async getAndSetLocalStorage() {
  //   const local = localStorage.getItem('family-tree') || '{}'
  //   const expired = JSON.parse(local).expired_at
  //   const date = new Date();

  //   if (expired === "" || expired < date.valueOf()) {
  //     const getData = await this.getAll()
  //     const compactData = JSON.stringify({
  //       "tree": getData,
  //       "expired_at": date.setDate(date.getDate() + 1).valueOf()
  //     })
  //     localStorage.setItem('family-tree', compactData)
  //     return JSON.parse(compactData)
  //   }
  // }

  // resyncData() {
  //   const data = JSON.parse(localStorage.getItem('family-tree') || '{}')

  //   localStorage.setItem('family-tree', JSON.stringify({
  //     "tree": data.tree,
  //     "expired_at": ""
  //   }))
  // }

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

export default new FamilyDataService();