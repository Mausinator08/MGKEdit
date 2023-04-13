/** @module game-logic/game-state-manager */

//#region Imports
import { IGameState } from "./game-state-interface";
//#endregion

/**
 * Handles the existance/activation/updating of IGameState objects.
 *
 * @export
 * @class StateManager
 */
export class StateManager {
    //#region Fields
    /**
     * Existing states available to activate. States in here are uninitialized
     *
     * @private
     * @type {Map<string, IGameState>}
     * @memberof StateManager
     */
    private states: Map<string, IGameState>;
    /**
     * External game-state directory for the game itself.
     *
     * @type {string}
     * @memberof StateManager
     */
    public stateDir: string;
    /**
     * Running (active) game-states.
     *
     * @type {Map<string, IGameState>}
     * @memberof StateManager
     */
    public activeStates: Map<string, IGameState>;
    //#endregion

    //#region Properties
    /**
     * Returns the number of existing states.
     *
     * @readonly
     * @memberof StateManager
     */
    public get count() {
        return this.states.size;
    }

    /**
     * Returns number of active states.
     *
     * @readonly
     * @memberof StateManager
     */
    public get runningCount() {
        return this.activeStates.size;
    }
    //#endregion

    /**
     * Creates an instance of StateManager.
     * @param {string} statePath Sets the statDir to the passed external directory containing the vairous game-states.
     * @memberof StateManager
     */
    constructor(statePath: string) {
        this.states = new Map<string, IGameState>();
        this.stateDir = statePath;
    }

    //#region Accessors
    /**
     * Get an existing state by its name.
     *
     * @template T
     * @param {string} name
     * @return {*}  {(T | null)}
     * @memberof StateManager
     */
    public GetByName<T>(name: string): T | null {
        try {
            if (!this.states.has(name)) {
                console.error("StateManager: GetByName() -> Could not get state [" + name + "]! A state with that name does not exist.");
                return null;
            }

            return this.states.get(name) as unknown as T;
        } catch (err) {
            console.error("StateManager: GetByName() -> Could not get state [" + name + "]!\n" + 
            "### ERROR:\n" + err);
            return null;
        }
    }

    /**
     * Get existing states by their type.
     *
     * @template T
     * @param {string} type
     * @return {*}  {(T[] | null)}
     * @memberof StateManager
     */
    public GetArrayByType<T>(type: string): T[] | null {
        try {
            let sts: T[] = new Array<T>();
            this.states.forEach(st => {
                sts.push(st as unknown as T);
            });

            return sts;
        } catch (err) {
            console.error("StateManager: GetArrayByType() -> Could not get any states of type <" + type + ">!\n" + 
            "### ERROR:\n" + err);
            return null;
        }
    }

    /**
     * Get an active state by name.
     *
     * @template T
     * @param {string} name
     * @return {*}  {(T | null)}
     * @memberof StateManager
     */
    public GetActiveByName<T>(name: string): T | null {
        try {
            if (!this.activeStates.has(name)) {
                console.error("StateManager: GetActiveByName() -> Could not get active state [" + name + "]! A state with that name is not active.");
                return null;
            }

            return this.activeStates.get(name) as unknown as T;
        } catch (err) {
            console.error("StateManager: GetActiveByName() -> Could not get active state [" + name + "]!\n" + 
            "### ERROR:\n" + err);
            return null;
        }
    }

    /**
     * Get active states by type.
     *
     * @template T
     * @param {string} type
     * @return {*}  {(T[] | null)}
     * @memberof StateManager
     */
    public GetActiveArrayByType<T>(type: string): T[] | null {
        try {
            let sts: T[] = new Array<T>();
            this.activeStates.forEach(st => {
                sts.push(st as unknown as T);
            });

            return sts;
        } catch (err) {
            console.error("StateManager: GetActiveArrayByType() -> Could not get any active states of type <" + type + ">!\n" + 
            "### ERROR:\n" + err);
            return null;
        }
    }
    //#endregion

    //#region CRUD Ops
    /**
     * Create a new game-state of specified type and insert it into the existing game-states.
     *
     * @param {string} name
     * @param {string} type
     * @return {*}  {string}
     * @memberof StateManager
     */
    public Create(name: string, type: string): string {
        try {
            if (this.states.has(name)) {
                console.error("StateManager: Create() -> Could not create state [" + name + "] of type <" + this.states.get(name).type + ">!\n" + 
                "A state with that name already exists. Expected type was <" + type + ">.");
                return JSON.stringify({ stateName: name, code: "exists" });
            }

            let state: any;

            try {
                state = require(this.stateDir + "/" + type + ".js");
            } catch (err) {
                try {
                    state = require(__dirname + "/../game-state/" + type + ".js");
                } catch (err2) {
                    console.error(
                    "{\n" + 
                    "    {\n" + 
                    "        ### ERROR 1:\n" + 
                    "        " + err + "\n" + 
                    "        ### ERROR 2:\n" + 
                    "        " + err2 + "\n" + 
                    "    }\n" + 
                    "}"
                    );
                }
            }

            this.states.set(name, state.Create(name));
            return JSON.stringify({ stateName: name, code: "created" });
        } catch (err) {
            console.error("StateManager: Create() -> Could not create state [" + name + "] of type <" + type + ">!\n" + 
            "Ensure you did not mistype the string for the <type> parameter. Also make sure the state type being referenced \n" + 
            "exists under './game-states/*.ts' and not in a different folder as well as not in a subfolder.\n" + 
            "### ERROR:\n" + err);
            return JSON.stringify({ stateName: name, code: "error" });
        }
    }

    /**
     * Add a games-state object created outside this StateManager.
     *
     * @param {IGameState} state
     * @return {*}  {boolean}
     * @memberof StateManager
     */
    public Add(state: IGameState): boolean {
        try {
            if (this.states.has(state.name) === true) {
                console.error("StateManager: Add() -> Could not add state [" + state.name + "] of type <" + state.type + ">!\n" + 
                "A state with that name already exists.");
                return false;
            }

            this.states.set(state.name, state);
            return true;
        } catch (err) {
            console.error("StateManager: Add() -> Could not add state [" + state.name + "] of type <" + state.type + ">!\n" + 
            "### ERROR:\n" + err);
            return false;
        }
    }

    /**
     * Remove a game state by it's name.
     *
     * @param {string} name
     * @return {*}  {boolean}
     * @memberof StateManager
     */
    public Remove(name: string): boolean {
        try {
            if (!this.states.has(name)) {
                console.error("StateManager: Remove() -> Could not remove state [" + name + "]!\n" + 
                "A state with that name does not exist.");
                return false;
            }

            return this.states.delete(name);
        } catch (err) {
            console.error("StateManager: Remove() -> Could not remove state [" + name + "]!\n" + 
            "### ERROR:\n" + err);
            return false;
        }
    }

    /**
     * Clear all existing game-states. (Active states will still be running.)
     *
     * @return {*}  {void}
     * @memberof StateManager
     */
    public Clear(): void {
        if (this.states.size > 0) {
            this.states.clear();
            return;
        }

        console.warn("StateManager: Remove() -> No states to clear! I'm empty!");
    }

    /**
     * Clear all active game-states. (Make sure to shutdown all active game states and that the game-state releases all its resources before clearing.)
     *
     * @memberof StateManager
     */
    public ClearActive(): void {
        if (this.activeStates.size > 0) {
            let st = this.activeStates.clear();
        }
    }
    //#endregion

    //#region Game State Manipulation Methods
    /**
     * Moves an existing game state to the active game-states map. (StateManager will handle initializing, updating, and shutting down.)
     *
     * @param {string} name
     * @return {*}  {boolean}
     * @memberof StateManager
     */
    public Activate(name: string): boolean {
        try {
            if (this.states.has(name) === false) {
                console.error("StateManager: Activate() -> Could not activate state [" + name + "] because the state does not exist!\n");
                return false;
            }

            if (this.activeStates.has(name) === true) {
                console.error("StateManager: Activate() -> Could not activate state [" + name + "] because it is already active!\n");
                return false;
            }

            this.activeStates.set(name, this.states.get(name));
        } catch (err) {
            console.error("StateManager: Activate() -> Could not activate state [" + name + "]!\n" + 
            "### ERROR:\n" + err);
            return false;
        }
    }

    /**
     * Deactivates the gamestate and removes it from the active game-states map. No more processing will occur.
     * WARNING! Make sure the game-state is shutdown or that the instance and its state exists elsewhere before calling this method!
     * VShutdown() is not called upon calling this method!
     *
     * @param {string} name
     * @return {*}  {boolean}
     * @memberof StateManager
     */
    public Deactivate(name: string): boolean {
        try {
            if (this.states.has(name) === false) {
                console.warn("StateManager: Deactivate() -> Deactivating state [" + name + "] while state does not exist!\n");
                return false;
            }

            if (this.activeStates.has(name) === false) {
                console.error("StateManager: Deactivate() -> Could not deactivate state [" + name + "] because it is not active!\n");
                return false;
            }

            this.activeStates.delete(name);
        } catch (err) {
            console.error("StateManager: Deactivate() -> Could not deactivate state [" + name + "]!\n" + 
            "### ERROR:\n" + err);
            return false;
        }
    }
    //#endregion

    //#region Control Methods
    /**
     * First initialization of each active game-state or if it needs re-initialization, that will happen in this method.
     *
     * @memberof StateManager
     */
    public Init(): void {
        if (this.activeStates.size > 0) {
            this.activeStates.forEach(st => {
                if (st.VIsReInit() === true) {
                    if (!st.VInit()) {
                        console.error("StateManager: Init() -> could not initialize state [" + st.name + "] of type <" + st.type + ">!");
                    }
                }
            });
        }
    }

    /**
     * If this game-state is to be automatically updated, the update will occur in this method. (Must be initialized.)
     *
     * @memberof StateManager
     */
    public Update(): void {
        if (this.activeStates.size > 0) {
            this.activeStates.forEach(st => {
                try {
                    // If updating is supposed to be manual...
                    if (st.autoUpdate === false) {
                        // ...Skip this state.
                        return;
                    }
                    
                    if (st.VIsInitialized()) {
                        st.VUpdate();
                    }
                } catch (err) {
                    console.error("StateManager: Update() -> could not update state [" + st.name + "] of type <" + st.type + ">!\n" + 
                    "### ERROR:\n" + err);
                }
            });
        }
    }

    /**
     * Shutdown the game-states that requested it. (Deactivate/Remove/ClearActive do not set the requestShutdown field to true, so this must be done elsewhere.)
     *
     * @memberof StateManager
     */
    public Shutdown(): void {
        if (this.activeStates.size > 0) {
            this.activeStates.forEach(st => {
                try {
                    if (st.VShutdownRequested() === true) {
                        st.VShutdown();
                    }
                } catch (err) {
                    console.error("StateManager: Shutdown() -> could not shutdown state [" + st.name + "] of type <" + st.type + ">!\n" + 
                    "### ERROR:\n" + err);
                }
            });
        }
    }
    //#endregion
}