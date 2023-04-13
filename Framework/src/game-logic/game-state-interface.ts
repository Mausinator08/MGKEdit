/** @module game-logic/game-state-interface */

/**
 * Used by game-state-manager to create and update the game state that derives from this interface.
 *
 * @export
 * @interface IGameState
 */
export interface IGameState {
    //#region Methods
    /**
     * Control method for initialization of the state. (Creates needed views for game logic)
     *
     * @return {*}  {boolean}
     * @memberof IGameState
     */
    VInit(): boolean;
    /**
     * The meat of the game state. Controlls specific logic in the way the views interact with each other and the system as a whole.
     *
     * @memberof IGameState
     */
    VUpdate(): void;
    /**
     * Called when the game state is to be unitialized or not used anymore.
     *
     * @memberof IGameState
     */
    VShutdown(): void;
    /**
     * Returns true if initialization was successfull.
     *
     * @return {*}  {boolean}
     * @memberof IGameState
     */
    VIsInitialized(): boolean;
    /**
     * Call VReInit() if the state of the game is restarting. (Next match, etc...)
     *
     * @memberof IGameState
     */
    VReInit(): void;
    /**
     * Returns true if reinitializing.
     *
     * @return {*}  {boolean}
     * @memberof IGameState
     */
    VIsReInit(): boolean;
    /**
     * Returns true if a request to terminate the gamestate ocurred.
     *
     * @return {*}  {boolean}
     * @memberof IGameState
     */
    VShutdownRequested(): boolean;
    /**
     * Requests the shutdown.
     *
     * @memberof IGameState
     */
    VRequestShutdown(): void;
    /**
     * The game state is safe to be removed. (Has been shutdown)
     *
     * @return {*}  {boolean}
     * @memberof IGameState
     */
    VCanClear(): boolean;
    //#endregion

    //#region Fields
    /**
     * Stores the name of the overriding class instance
     *
     * @type {string}
     * @memberof IGameState
     */
    name: string;
    /**
     * Stores the type of the overriding class
     *
     * @type {string}
     * @memberof IGameState
     */
    type: string;
    /**
     * Whether this game-state is to have its VUpdate() function called automatically by game-state-manager.
     *
     * @type {boolean}
     * @memberof IGameState
     */
    autoUpdate: boolean;
    /**
     * Whether to call VInit() for this game-state again.
     *
     * @type {boolean}
     * @memberof IGameState
     */
    reInit: boolean;
    /**
     * Whether the VShutdown() for this game-state is to be called in game-state-manager.
     *
     * @type {boolean}
     * @memberof IGameState
     */
    requestShutdown: boolean;
    /**
     * indicates that it is safe to clear this game-state from the game-state-manager. (VIsInitialized() needs to be false after resources are cleared before setting canClear to true.)
     *
     * @type {boolean}
     * @memberof IGameState
     */
    canClear: boolean;
    //#endregion
}