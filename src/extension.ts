import * as vscode from 'vscode';
import Helper from './common/Helper';
import { getLogger, Logger, showLog } from './common/Logger';
import CmdController from "./logic/CmdController";
import * as fs from "fs";

let _cmdController: CmdController | undefined;
let isInit = false;
let logger: Logger;

export function activate({ subscriptions }: vscode.ExtensionContext) {
	showLog();
	logger = getLogger("extension");
	logger.debug("activate");

	subscriptions.push(vscode.workspace.onDidChangeWorkspaceFolders(e => {
		logger.debug("WorkspaceFolderChange", e);
		init(subscriptions);
	}));

	init(subscriptions);
}
async function init(subscriptions: vscode.Disposable[]) {
	logger.debug("init");
	let isNpmProject = fs.existsSync(Helper.getPackageJsonPath());
	logger.debug(`init isEgretProject=`, isNpmProject);
	if (!isNpmProject) {
		await destroy();
		return;
	} else {
		if (!isInit) {
			isInit = true;
			let scripts = JSON.parse(await Helper.readFile(Helper.getPackageJsonPath())).scripts;
			_cmdController = new CmdController(subscriptions, scripts);
		}
	}
}

export async function deactivate() {
	logger.debug("deactivate");
	await destroy();
}
async function destroy() {
	if (isInit) {
		logger.debug("destroy");
	}
	isInit = false;
	if (_cmdController) {
		await _cmdController.destroy();
		_cmdController = undefined;
	}
}