/** @module game-logic/base-game-logic */

//#region Imports
import { GameCore } from "./../game/game-core";
import { ViewManager } from "../game-views/game-view-manager";
import { HumanView } from "./../game-views/types/human-view";
import { IGameState } from "./game-state-interface";
import { StateManager } from "./game-state-manager";
//#endregion

/**
 * Base game logic class to be overriden by the game's specific logic class.
 * game-core class contains this class in its composition.
 *
 * @export
 * @class BaseGameLogic
 */
export class BaseGameLogic {
    //#region Fields
    /**
     * This is called from the subclass's preinit function before anything else. (Creates the minimal views and setup.)
     *
     * @type {(BaseGameLogic) => boolean}
     * @memberof BaseGameLogic
     */
    public preInitFunc: (logic: BaseGameLogic) => boolean;
    /**
     * Whether logic is paused. (Rendering continues)
     *
     * @protected
     * @type {boolean}
     * @memberof BaseGameLogic
     */
    protected paused: boolean = false;
    /**
     * Stores whether logic has been initialized.
     *
     * @protected
     * @type {boolean}
     * @memberof BaseGameLogic
     */
    protected isInitialized: boolean = false;
    /**
     * Is this the server or just the client game logic.
     *
     * @type {boolean}
     * @memberof BaseGameLogic
     */
    public isServerLogic: boolean = false;
    /**
     * The view manager. (The human view(s) contain(s) the rendering scene and user input. Other view types can be inserted in the view manager.)
     *
     * @type {ViewManager}
     * @memberof BaseGameLogic
     */
    public viewMan: ViewManager;
    /**
     * A string list of the names of the views created in preInitFunc function.
     *
     * @type {string[]}
     * @memberof BaseGameLogic
     */
    public createdViews: string[] = [];
    /**
     * Stores whether we a reinitializing the logic.
     *
     * @protected
     * @type {boolean}
     * @memberof BaseGameLogic
     */
    protected reInit: boolean = true;
    /**
     * Stores true when it's time for game logic to terminate.
     *
     * @protected
     * @type {boolean}
     * @memberof BaseGameLogic
     */
    protected requestShutdown: boolean = false;
    /**
     * This manages the various states of the game. (Main menu/multiplayer match/campaign or story/lobby/settings)
     *
     * @protected
     * @type {StateManager}
     * @memberof BaseGameLogic
     */
    protected stateManager: StateManager;
    //#endregion

    /**
     * Creates an instance of BaseGameLogic.
     * @param {string} viewPath
     * @param {string} statePath
     * @memberof BaseGameLogic
     */
    constructor(viewPath: string, statePath: string) {
        this.viewMan = new ViewManager(viewPath);
        this.stateManager = new StateManager(statePath);
    }

    //#region Control Method Overrides
    // OVERRIDES
    /**
     * Accesses the members of the StateManager to manipulate the game's state with new game states.
     * Override in game's specific game logic class.
     * 
     * @param {string} name
     * @param {string} type
     * @memberof BaseGameLogic
     */
    public CreateGameState(name: string, type: string): string {
        return this.stateManager.Create(name, type);
    }

    /**
     * Initialize the game states that need it and create their views if not already.
     * Override in game's specific game logic class.
     *
     * @return {*}  {boolean}
     * @memberof BaseGameLogic
     */
    public VInit(): boolean {
        if (this.reInit === true) {
            if (this.preInitFunc !== null) {
                if (this.preInitFunc(this) === false) {
                    GameCore.game.Quit();
                    return false;
                } else {
                    this.viewMan.Init();
                    this.isInitialized = true;
                }
            }
        } else {
            this.viewMan.Init();
        }

        this.reInit = false;
        return true;
    }

    /**
     * Update the game logic. (If server, human view types are omitted. Servers do not directly interact with human input.)
     * Override in game's specific game logic class.
     *
     * @return {*}  {void}
     * @memberof BaseGameLogic
     */
    public VUpdate(): void {
        // Do not continue any further if we are not initialized or the game logic is paused.
        if (this.paused === true || this.isInitialized === false) {
            // At least check the human view if this is not set on a server so that a working dialog can still appear and be used for exit prompts and warnings/errors.
            if (this.isServerLogic === true) {
                // TODO: Something needs to check for whether or not we are shutting down the server here:
                return;
            }

            // Render all humans!
            if (this.viewMan.GetArrayByType<HumanView>("HumanView") && (this.viewMan.GetArrayByType<HumanView>("HumanView") as HumanView[])?.length > 0) {
                (this.viewMan.GetArrayByType<HumanView>("HumanView") as HumanView[])?.forEach(hv => {
                    if (hv.VIsInitialized() === true) {
                        hv.VUpdate();
                    }
                });
            }

            return;
        }

        // Update views that have autoUpdate set to true;
        this.viewMan.Update();

        // If this is the game server, no further updates are needed. (No HumanViews on game server... DESTROY ALL HUMANS! "Um... Lambert? Am I being stealthy enough?" : "Keep it up Fisher, you're doing great!")
        if (this.isServerLogic === true) {
            return;
        }

        // Render all humans!
        if (this.viewMan.GetArrayByType<HumanView>("HumanView") && (this.viewMan.GetArrayByType<HumanView>("HumanView") as HumanView[])?.length > 0) {
            (this.viewMan.GetArrayByType<HumanView>("HumanView") as HumanView[])?.forEach(hv => {
                if (hv.VIsInitialized() === true) {
                    hv.VUpdate();
                }
            });
        }
    }

    /**
     * Shutdown game logic components that need to be, and if quitting, then all of it gets shutdown.
     * Override in game's specific game logic class.
     *
     * @memberof BaseGameLogic
     */
    public VShutdown(): void {
        this.viewMan.Shutdown();

        if (GameCore.game.Quitting() === true) {
            this.viewMan.Clear();
            this.isInitialized = false;
        }
    }
    // END OVERRIDES
    //#endregion
}
