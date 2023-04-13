/** @module system/system-dialog */

//#region Imports
import { BrowserWindow } from "electron";
import * as remote from "@electron/remote";
import { GameCore } from "./../game/game-core"
//#endregion

/**
 * HTML modal dialog system. (Quit prompts, error messages, etc...)
 *
 * @export
 * @class SystemDialog
 */
export class SystemDialog {
    /**
     * Creates an instance of SystemDialog.
     * @memberof SystemDialog
     */
    constructor() {
    }

    //#region Dialog Prompts
    /**
     * An unrecoverable error has occurred.
     *
     * @param {string} message
     * @param {(event: MouseEvent) => void} action
     * @param {number} exitCode
     * @return {*}  {HTMLElement}
     * @memberof SystemDialog
     */
    public Fatal(message: string, action: (event: MouseEvent) => void, exitCode: number): HTMLElement {
        let errorPopup: HTMLDivElement = document.createElement("div");

        errorPopup.setAttribute("id", "fatalError");
        errorPopup.setAttribute("class", "ui-system-dialog-popup");

        let heading: HTMLHeadingElement = document.createElement("h1");
        let errorMsg: HTMLHeadingElement = document.createElement("h2");

        heading.setAttribute("style", "color: red;");
        heading.innerHTML = "FATAL ERROR:";
        errorMsg.setAttribute("style", "color: red;");
        errorMsg.innerHTML = message;

        let okButton: HTMLButtonElement = document.createElement("button");

        okButton.innerHTML = "OK";
        okButton.setAttribute("id", "btnFatalOK");
        okButton.setAttribute("style", "color: red; background-color: rgba(80, 80, 80, 80); border-width: 2pt; border-style: solid; border-color: red; border-radius: 2pt; font-size: 14pt;");
        okButton.addEventListener(
            "click", 
            function(event: MouseEvent) {
                action(event);
                let _window: BrowserWindow = remote.getCurrentWindow();
                remote.require('@electron/remote/main').enable(_window.webContents);
                _window.close();
                process.exit(exitCode);
            }
        );

        errorPopup.appendChild(heading);
        errorPopup.appendChild(errorMsg);
        errorPopup.appendChild(okButton);

        return errorPopup;
    }

    /**
     * The user requested to quit.
     *
     * @return {*}  {HTMLElement}
     * @memberof SystemDialog
     */
    public QuitPrompt(): HTMLElement {
        let prompt: HTMLDivElement = document.createElement("div");

        prompt.setAttribute("id", "quitPrompt");
        prompt.setAttribute("class", "ui-system-dialog-popup");

        let heading: HTMLHeadingElement = document.createElement("h1");
        let quitMsg: HTMLHeadingElement = document.createElement("h2");

        heading.setAttribute("style", "color: purple;");
        heading.innerHTML = "QUITTING?";
        quitMsg.setAttribute("style", "color: white;");
        quitMsg.innerHTML = "Are you sure that you want to quit?";

        let yesButton: HTMLButtonElement = document.createElement("button");
        let noButton: HTMLButtonElement = document.createElement("button");

        yesButton.innerHTML = "YES";
        yesButton.setAttribute("id", "btnQuitYes");
        yesButton.setAttribute("style", "color: green; background-color: rgba(80, 80, 80, 80); border-width: 2pt; border-style: solid; border-color: green; border-radius: 2pt; font-size: 14pt;");
        yesButton.addEventListener(
            "click", 
            function (event: MouseEvent) {
                GameCore.game.Quit();
            }
        );
        
        noButton.innerHTML = "NO";
        noButton.setAttribute("id", "btnQuitNo");
        noButton.setAttribute("style", "color: red; background-color: rgba(80, 80, 80, 80); border-width: 2pt; border-style: solid; border-color: red; border-radius: 2pt; font-size: 14pt;");
        noButton.addEventListener(
            "click", 
            function (event: MouseEvent) {
                GameCore.game.CancelExit();
                prompt.remove();
            }
        );

        prompt.appendChild(heading);
        prompt.appendChild(quitMsg);
        prompt.appendChild(yesButton);
        prompt.appendChild(noButton);

        return prompt;
    }
    //#endregion
}
