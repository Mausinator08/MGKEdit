/** @module game/game-core */

//#region Imports
import { ComponentManager } from "./../components/component-manager";
import { BrowserWindow } from "electron";
import * as remote from "@electron/remote";
import { BaseGameLogic } from "./../game-logic/base-game-logic";
import { SystemDialog } from "./../system/system-dialog";
//#endregion

//#region Globals
/** @type {*} */
var gameLoaded: boolean = false;
/** @type {*} */
var loadGame: () => void;
//#endregion

/**
 * This is the base game system. All system components live in the component manager in this class.
 * The game logic class is instantiated and controlled from this class.
 *
 * @export
 * @class GameCore
 */
export class GameCore {
    //#region Fields
    /**
     * This function is assigned to from the game project in the class that inherits this class.
     *
     * @type {(game: GameCore) => boolean}
     * @memberof GameCore
     */
    public preInitFunc: (game: GameCore) => boolean;
    /**
     * The index.html rendering canvas.
     *
     * @type {HTMLCanvasElement}
     * @memberof GameCore
     */
    public _canvas: HTMLCanvasElement;
    /**
     * Controls system components and their flow.
     *
     * @type {ComponentManager}
     * @memberof GameCore
     */
    public comMan: ComponentManager;
    /**
     * Used to determine if the user confirmed that they want to exit.
     *
     * @protected
     * @type {boolean}
     * @memberof GameCore
     */
    protected quitting: boolean = false;
    /**
     * Used to determine if the user has clicked the X, or triggered an exit is some way before the user confirms that they want to exit.
     *
     * @protected
     * @type {boolean}
     * @memberof GameCore
     */
    protected exitting: boolean = false;
    /**
     * This holds an array of strings for the names of the components that were created in the preInitFunc function.
     *
     * @type {string[]}
     * @memberof GameCore
     */
    public createdComponents: string[] = [];
    /**
     * If quitting, for any reason, this holds the exit code. (0 if OK, positive number if error depending on error.)
     *
     * @protected
     * @type {number}
     * @memberof GameCore
     */
    protected exitCode: number = 0;
    /**
     * The game's logic class which also contains views and actors and manipulates the game's components.
     *
     * @type {BaseGameLogic}
     * @memberof GameCore
     */
    public gameLogic: BaseGameLogic;
    /**
     * Whether the game is initialized.
     *
     * @protected
     * @type {boolean}
     * @memberof GameCore
     */
    protected isInitialized: boolean = false;
    /**
     * Whether the game needs to be reinitialized such as a critical change in settings.
     *
     * @protected
     * @type {boolean}
     * @memberof GameCore
     */
    protected reInit: boolean = true;

    /**
     * Holds the basic dialog for the system. (This is NOT game UI)
     *
     * @protected
     * @type {SystemDialog}
     * @memberof GameCore
     */
    protected systemDialog: SystemDialog = new SystemDialog();
    //#endregion

    //#region Static Fields
    /**
     * Holds a copy of GameCore's instance after initialization to be referenced throughout the game's other parts.
     *
     * @static
     * @type {GameCore}
     * @memberof GameCore
     */
    static game: GameCore;
    //#endregion

    //#region Static Accessors
    /**
     * The game using this framework passes itself through this function to be used in other sections of the game.
     *
     * @static
     * @template T
     * @param {T} gameType
     * @memberof GameCore
     */
    static SetGameType<T>(gameType: T): void {
        GameCore.game = gameType as unknown as GameCore;
    }
    //#endregion

    /**
     * Creates an instance of GameCore.
     * @param {string} canvasElement
     * @param {string} comPath
     * @param {BaseGameLogic} logic
     * @memberof GameCore
     */
    constructor(canvasElement: string, comPath: string, logic: BaseGameLogic) {
        this.gameLogic = logic;
        this._canvas = document.getElementById(canvasElement) as HTMLCanvasElement;
        this.comMan = new ComponentManager(comPath);
    }

    //#region Accessors
    /**
     * The call to reinitialize the game if needed...
     *
     * @readonly
     * @type {boolean}
     * @memberof GameCore
     */
    public get ReInit(): boolean {
        return this.reInit;
    }

    /**
     * Returns wether the program is terminating or still running
     *
     * @return {*}  {boolean}
     * @memberof GameCore
     */
    public Quitting(): boolean {
        return this.quitting;
    }

    /**
     * Tell engine to start shutting down and then terminate
     *
     * @memberof GameCore
     */
    public Quit(): void {
        this.quitting = true;
    }

    /**
     * Returns whether the user requested to exit
     *
     * @return {*}  {boolean}
     * @memberof GameCore
     */
    public Exitting(): boolean {
        return this.exitting;
    }

    /**
     * The user requested to exit
     *
     * @memberof GameCore
     */
    public Exit(): void {
        this.exitting = true;
    }

    /**
     * The user decided not to exit after initial exit request... (make up your mind!!!)
     *
     * @memberof GameCore
     */
    public CancelExit(): void {
        this.exitting = false;
    }

    /**
     * Returns true if the game is reinitializing.
     *
     * @memberof GameCore
     */
    public ReInitialize(): void {
        this.reInit = true;
        this.isInitialized = false;
    }
    //#endregion

    //#region Dialog Methods
    /**
     * Call this if an unrecoverable error ocurrs.
     *
     * @param {string} message
     * @param {(event: MouseEvent) => void} action
     * @param {number} exitCode
     * @return {*}  {HTMLElement}
     * @memberof GameCore
     */
    public Fatal(message: string, action: (event: MouseEvent) => void, exitCode: number): HTMLElement {
        return this.systemDialog.Fatal(message, action, exitCode);
    }

    /**
     * Displays the dialog for when the user wants to exit confirming if they really want to exit.
     *
     * @return {*}  {HTMLElement}
     * @memberof GameCore
     */
    public QuitPrompt(): HTMLElement {
        return this.systemDialog.QuitPrompt();
    }
    //#endregion

    //#region Control Method Overrides
    // OVERRIDES
    /**
     * Will call the preInitialization function first and then run at least one engine update before looping.
     * Override this method.
     *
     * @return {*}  {boolean}
     * @memberof GameCore
     */
    public VInit(): boolean {
        try {
            if (this.preInitFunc !== null) {
                let preState: boolean = true;
                    
                if (this.reInit === true) {
                    preState = this.preInitFunc(this);
                }

                if (preState === true) {
                    this.comMan.Init();

                    if (!this.gameLogic.VInit()) {
                        return false;
                    }

                    if (this.reInit === true) {
                        this.reInit = false;
                        this.isInitialized = true;
                        this.VUpdate();
                    }
                } else {
                    this.reInit = false;
                    this.Quit();
                    return false;
                }
            }

            this.isInitialized = true;
            if (this.reInit === true) {
                this.reInit = false;
            }
            return true;
        } catch (err) {
            if (this.reInit === true) {
                this.isInitialized = false;
                this.reInit = false;
            }

            console.error("GameCore: VInit() -> ### ERROR:\n" + err);
            return false;
        }
    }

    /**
     * Updates the game logic and views.
     * Override this method.
     *
     * @return {*}  {void}
     * @memberof GameCore
     */
    public VUpdate(): void {
        if (!this.quitting) {
            if (this.reInit === true) {
                return;
            }

            if (this.isInitialized === false) {
                return;
            }

            // Update components
            this.comMan.Update();
            this.gameLogic.VUpdate();

            // Get the current window and define how its events are handled.
            window.onbeforeunload = (events: { returnValue: boolean; preventDefault: () => void; }) => {
                if (this.Quitting() === false) {
                    events.returnValue = false;
                    events.preventDefault();
                    this.Exit();
                    return;
                }
            };
        }
    }

    /**
     * Will call the shutdown() functions of the game logic/views/components as need. If quitting === true the whole game shutsdown.
     * Override this method.
     *
     * @memberof GameCore
     */
    public VShutdown(): void {
        this.gameLogic.VShutdown();
        this.comMan.Shutdown();

        if (this.quitting === true) {
            this.comMan.Clear();
            let _window: BrowserWindow = remote.getCurrentWindow();
            remote.require('@electron/remote/main').enable(_window.webContents);
            _window.destroy();
            process.exit(this.exitCode);
        }
    }
    // END OVERRIDES
    //#endregion
}

//#region Exports
/**
 * OnDOMContentLoaded is exported so that it can be passed the cbLoadGame function which is defined
 * in the game system class inheriting the class GameCore, usually in the game project that uses this framework.
 *
 * @export
 * @param {() => void} cbLoadGame
 */
export function OnDOMContentLoaded(cbLoadGame: () => void): void {
    loadGame = cbLoadGame;
}
//#endregion

//#region Global Execution
/** Add event listener for when to start the game engine after the electron application is loaded. */
window.addEventListener('DOMContentLoaded', () => {
    if (!gameLoaded){
        loadGame();
        gameLoaded = true;
    }
});
//#endregion
