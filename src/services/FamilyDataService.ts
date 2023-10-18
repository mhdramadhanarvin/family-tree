import { child, get, ref, update } from "firebase/database";
import { database } from "../config/firebase";
import FamilyData, { Node } from "../types/family.type"
const path = '/family'
const db = ref(database, path);

class FamilyDataService {
  async getAll() {
    try {
      const snapshot = await get(child(db, `/`))
      const data = snapshot.val()
      return this.mappingData(data)
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async create(familyData: FamilyData) {
    // return set(db, familyData);
    const keyLatestData = await this.getAll().then(data => { return data.length })
    const updates: any = {};
    updates[keyLatestData] = familyData;
    return update(db, updates);
  }

  async update(familyData: any, index: number) {
    const updates: any = {};
    updates[index] = familyData;

    return update(db, updates);
  }

  async getById(id: string | undefined) {
    return this.getAll().then(data => data.filter((dataFirst) => dataFirst.id === id)[0])
  }

  async getIndexById(id: string) {
    return this.getAll().then(data => data.findIndex((index: any) => index.id === id))
  }

  mappingData(familyData: Node[]) {

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
        job: ""
      };

      const mappedData = {
        ...defaultNode,
        ...data,
      };
      return mappedData;
    });
  }
}

export default new FamilyDataService();