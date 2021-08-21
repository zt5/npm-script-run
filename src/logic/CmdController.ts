import * as vscode from 'vscode';
import { Command } from '../common/Command';
import Helper from '../common/Helper';
import Listener from "../common/Listener";
import { getLogger, Logger, showLog } from '../common/Logger';
import ViewBar from './ViewBar';
export default class CmdController extends Listener {
    private _bar: ViewBar;
    private _scripts: string[];
    private logger: Logger;
    public constructor(protected subscriptions: vscode.Disposable[], scripts: { [key: string]: string }) {
        super();
        this.logger = getLogger(this);
        if (scripts) {
            this._scripts = Object.keys(scripts);
        } else {
            this._scripts = [];
        }

        this._bar = new ViewBar(this, subscriptions);

        for (let i = 0; i < 20; i++) {
            this.addListener(vscode.commands.registerCommand(Command.SCRIPT_CALL + "_" + i, () => {
                this.logger.debug(`call ${Command.SCRIPT_CALL}_${i}`);
                this.execDebug(this._scripts[i]);
            }));
        }
        const pickItemCmds = this._scripts.map((_, index) => Command.SCRIPT_CALL + "_" + index);
        this.addListener(vscode.commands.registerCommand(Command.SCRIPT_CALL, () => {
            this.logger.debug(`receive cmd: ${Command.SCRIPT_CALL}`)
            vscode.window.showQuickPick(this._scripts).then(result => {
                this.logger.debug(`select cmd: ${result}`)
                if (result) {
                    let pickIndex = this._scripts.indexOf(result);
                    if (pickIndex != -1) vscode.commands.executeCommand(pickItemCmds[pickIndex]);
                }
            })
        }));
        showLog();
    }
    private execDebug(scriptName: string) {
        let name = "npm";
        let config = vscode.workspace.getConfiguration("npm");
        if (config) {
            const packManager = config.get<string>("packageManager");
            if (packManager && packManager != "auto") name = packManager;
        }
        showLog();
        vscode.commands.executeCommand(
            "extension.js-debug.createDebuggerTerminal",
            `${name} run ${scriptName}`,
            Helper.getCurRootUri(),
            { cwd: Helper.getCurRootPath() }
        )
    }
    public get bar() {
        return this._bar;
    }
    public get scripts() {
        return this._scripts;
    }
    public async destroy() {
        super.destroy();
        this.logger.debug("destroy");
        if (this._bar) {
            this._bar.destroy();
        }
    }
}