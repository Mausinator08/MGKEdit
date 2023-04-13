/** @module game-views/game-view-interface */

//#region Imports
import { BaseGameLogic } from "./../game-logic/base-game-logic"
//#endregion

/**
 * This is the interface to be used by various views like the human view, and this interface's methods are called by game-view-manager. 
 *
 * @export
 * @interface IGameView
 */
export interface IGameView {
    //#region Methods
    /**
     * Initialization of the view
     *
     * @return {*}  {boolean}
     * @memberof IGameView
     */
    VInit(): boolean;
    /**
     * Updates the behavior of the view.
     *
     * @memberof IGameView
     */
    VUpdate(): void;
    /**
     * When requested, will free resources and shutdown the view
     *
     * @memberof IGameView
     */
    VShutdown(): void;
    /**
     * Whether successfully initialized
     *
     * @return {*}  {boolean}
     * @memberof IGameView
     */
    VIsInitialized(): boolean;
    /**
     * re-initialize the view
     *
     * @memberof IGameView
     */
    VReInit(): void;
    /**
     * Whether to re-initialize the view
     *
     * @return {*}  {boolean}
     * @memberof IGameView
     */
    VIsReInit(): boolean;
    /**
     * Whether a shutdown was requested.
     *
     * @return {*}  {boolean}
     * @memberof IGameView
     */
    VShutdownRequested(): boolean;
    /**
     * Request a shutdown.
     *
     * @memberof IGameView
     */
    VRequestShutdown(): void;
    //#endregion

    //#region Fields
    /**
     * The name of the view instance.
     *
     * @type {string}
     * @memberof IGameView
     */
    name: string;
    /**
     * The type of view.
     *
     * @type {string}
     * @memberof IGameView
     */
    type: string;
    /**
     * Whether game-view-manager updates this view instance automatically.
     *
     * @type {boolean}
     * @memberof IGameView
     */
    autoUpdate: boolean;
    /**
     * Whether to re-initialized the view.
     *
     * @type {boolean}
     * @memberof IGameView
     */
    reInit: boolean;
    /**
     * Whether to shutdown the view.
     *
     * @type {boolean}
     * @memberof IGameView
     */
    requestShutdown: boolean;
    /**
     * Stores a reference to the game's logic system.
     *
     * @type {BaseGameLogic}
     * @memberof IGameView
     */
    gameLogic: BaseGameLogic;
    //#endregion
}