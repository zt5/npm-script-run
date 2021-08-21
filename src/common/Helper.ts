import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as vscode from "vscode";
import { Platform } from "../define";

export default class Helper {
	public static convertObjStr(msg: string | number | boolean | Error | unknown) {
		if (typeof msg == "string") return msg;
		else if (typeof msg == "number") return `${msg}`;
		else if (typeof msg == "boolean") return `${msg}`;
		else if (msg instanceof Error) {
			if (msg.stack) return msg.stack;
			else return msg.message;
		}
		else if (msg === null || msg === undefined) return `${msg}`;
		else return JSON.stringify(msg);
	}


	public static getPlatform() {
		const platform = os.platform();
		switch (platform) {
			case 'darwin':
				return Platform.OSX;
			case 'win32':
				return Platform.Windows;
			default:
				return Platform.Unknown;
		}
	}
	public static createMarkTxt(str?: string) {
		const mark = new vscode.MarkdownString(str, true);
		mark.isTrusted = true;
		return mark;
	}

	public static convertFullPath(cur: string) {
		let rootPath = this.getCurRootPath()
		if (rootPath) {
			return path.normalize(path.join(rootPath, cur));
		}
		return null;
	}

	public static getCurRootUri() {
		let result: vscode.WorkspaceFolder | undefined;
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (workspaceFolders && workspaceFolders.length > 0) {
			for (const workspaceFolder of workspaceFolders) {
				const folderString = workspaceFolder.uri.fsPath;
				if (!folderString) {
					continue;
				}
				const packageJsonConfig = path.join(folderString, "package.json");
				if (!fs.existsSync(packageJsonConfig)) {
					continue;
				}
				result = workspaceFolder;
				break;
			}
		}
		return result;
	}
	public static getCurRootPath() {
		let result: string = "";
		let folder = this.getCurRootUri();
		if (folder) result = folder.uri.fsPath
		return result;
	}
	public static getPackageJsonPath() {
		return path.join(this.getCurRootPath(), "package.json");
	}

	public static readFile(file: string): Promise<string> {
		return new Promise((resolve, reject) => {
			fs.readFile(file, { encoding: "utf-8" }, (err, data) => {
				if (err) reject(err);
				else resolve(data);
			})
		})
	}

	public static fillNum(num: string | number) {
		let _num = +num;
		if (isNaN(_num)) return `${num}`;
		else if (_num < 10) return `0${_num}`;
		else return `${_num}`;
	}
}
