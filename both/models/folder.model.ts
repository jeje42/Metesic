import { CollectionObject } from './collection-object.model';


export class Folder implements CollectionObject {
	/**
	 * The key
	 */
	path: string;
	/**
	 * The relative name, useful for the UI.
	 */
	name: string;
	/**
	 * Key of the father
	 */
	father: string;
	/**
	 * An array of children, the name is given to identify children
	 */
	children: string[];
	/**
	 * Is it a file or just a folder ?
	 */
	isFolder: boolean;
	/**
	 * Flag to determine if the file is part of the collection of videos.
	 */
	isInCollection: boolean;
	size: number;

	constructor(path: string, name: string, father: string, children: string[], isFolder: boolean, isInCollection: boolean) {
		this.path = path;
		this.name = name;
		this.father = father;
		this.children = children;
		this.isFolder = isFolder;
		this.isInCollection = isInCollection;
	}

	public static createChildPath(fatherPath: string, childName: string): string {
		if (fatherPath === "/") {
			return fatherPath + childName;
		}
		return fatherPath + "/" + childName;
	}

	public static createNameFromPath(path: string): string {
		if (path === undefined)
			return undefined;

		return path.substring(path.lastIndexOf("/") + 1);
	}

	public static createFatherPath(childPath: string): string {
		var lastSlash: number = childPath.lastIndexOf("/");
		if (lastSlash === 0) {
			return "/";
		} else {
			return childPath.substring(0, lastSlash);
		}
	}
}
