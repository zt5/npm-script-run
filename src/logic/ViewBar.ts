import { fstat } from 'fs';
import * as vscode from 'vscode';
import { Command } from '../common/Command';
import Helper from '../common/Helper';
import Listener from '../common/Listener';
import { getLogger, Logger } from '../common/Logger';
import CmdController from './CmdController';
export default class ViewBar extends Listener {
    private statusBar: vscode.StatusBarItem;
    private logger: Logger;
    public constructor(private controller: CmdController, protected subscriptions: vscode.Disposable[]) {
        super();
        this.logger = getLogger(this);

        this.statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
        this.statusBar.command = Command.SCRIPT_CALL;
        this.statusBar.show();
        this.statusBar.text = "NPM调试"

        let menus = Helper.createMarkTxt();
        for (let i = 0; i < controller.scripts.length; i++) {
            const key = controller.scripts[i];
            menus.appendMarkdown(`[${key}](command:${Command.SCRIPT_CALL + "_" + i})  \n`);
        }
        this.statusBar.tooltip = menus;
        subscriptions.push(this.statusBar);
    }
    public destroy() {
        super.destroy();
        this.logger.debug(`destroy`)
        if (this.statusBar) {
            this.statusBar.dispose();
        }
    }
}