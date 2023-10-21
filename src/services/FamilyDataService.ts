import { child, get, ref, update } from "firebase/database";
import { database } from "../config/firebase";
import FamilyData, { Node } from "../types/family.type"
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

export const supabase = createClient(process.env.REACT_APP_SUPABASE_HOST || "", process.env.REACT_APP_SUPABASE_KEY || "");

const tableName = 'family'
const path = '/family'
const db = ref(database, path);

class FamilyDataService {
  async getAll(): Promise<Node[]> {
    try {
      const { data }: any = await supabase
        .from(tableName)
        .select('tree')
        .single()
      return this.mappingData(data.tree)
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async create(familyData: any) {
    // return set(db, familyData);
    // const keyLatestData = await this.getAll().then(data => { return data.length })
    // const updates: any = {};
    // updates[keyLatestData] = familyData;
    // return update(db, updates);
    // return await supabase.from(tableName).insert({
    //   tree: [
    //     {
    //       a: 1
    //     }, {
    //       b: 2
    //     }
    //   ],
    //   created_at: new Date(),
    //   updated_at: new Date()
    // })
    // return this.getAll().then(async (data) => {
    //   // return data.push(familyData) 
    //   // return data.push(familyData)
    // const getIndex = await this.getIndexById()
    const length = (await this.getAll()).length
    // return length
    return await
      supabase
        .from(tableName)
        .upsert({
          // id: 1,
          tree: {
            name: "A"
          },
          created_at: new Date()
        },
        )
        .select()
    // .update({ tree: data.push(familyData) })
    // .eq('tree -> id', 'user19')
    // })
  }

  async update(familyData: any) {
    // const updates: any = {};
    // updates[index] = familyData;

    // return update(db, updates); 
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
    // return await supabase.from(tableName).select('*');
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