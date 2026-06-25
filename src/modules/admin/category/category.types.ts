import { Category } from "../../../generated/prisma/client.js";

//CATEGORIAS
export type category = {
  id: Category["id"];
  uuid: Category["uuid"];
  name: Category["name"];
  description: Category['description'];
  position: Category['position']
  parentId: Category["uuid"] | null;
  imageURL: Category["imageURL"] | null;
};

export type createCategory = Pick<category, "name"| "description" | "position" | "parentId" | "imageURL">;

export type updateRootCategory = Pick<category, "name" | "position">;

export type updateSubCategory = Pick<category, "name"| "description" | "position" | 'imageURL'>;

