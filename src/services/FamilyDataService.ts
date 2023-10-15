import { child, get, ref, set } from "firebase/database";
import { database } from "../config/firebase";
import { Node } from "../types/family.type"
import { Gender } from "relatives-tree/lib/types";

const db = ref(database, '/family');

class FamilyDataService {
  async getAll() {
    try {
      const snapshot = await get(child(db, `/`))
      return snapshot.val()
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  create(familyData: Node) {
    return set(db, familyData);
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