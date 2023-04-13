/** @module game-views/game-view-manager */

//#region Imports
import { IGameView } from "./game-view-interface";
import { GameCore } from "./../game/game-core";
//#endregion

/**
 * Manages and updates game-views like the human view.
 *
 * @export
 * @class ViewManager
 */
export class ViewManager {
    //#region Fields
    /**
     * List of active views.
     *
     * @private
     * @type {Map<string, IGameView>}
     * @memberof ViewManager
     */
    private views: Map<string, IGameView>;
    /**
     * External game directory to search for view types when creating views.
     *
     * @type {string}
     * @memberof ViewManager
     */
    public viewDir: string;
    //#endregion

    //#region Properties
    /**
     * Number of views in ViewManager.
     *
     * @readonly
     * @memberof ViewManager
     */
    public get count() {
        return this.views.size;
    }
    //#endregion

    /**
     * Creates an instance of ViewManager.
     * @param {string} viewPath
     * @memberof ViewManager
     */
    constructor(viewPath: string) {
        this.views = new Map<string, IGameView>();
        this.viewDir = viewPath;
    }

    //#region Accessors
    /**
     * Get a view by name
     *
     * @template T
     * @param {string} name
     * @return {*}  {(T | null)}
     * @memberof ViewManager
     */
    public GetByName<T>(name: string): T | null {
        try {
            if (!this.views.has(name)) {
                console.error("ViewManager: GetByName() -> Could not get view [" + name + "]! A view with that name does not exist.");
                return null;
            }

            return this.views.get(name) as unknown as T;
        } catch (err) {
            console.error("ViewManager: GetByName() -> Could not get view [" + name + "]!\n" + 
            "### ERROR:\n" + err);
            return null;
        }
    }

    /**
     * Get views by type.
     *
     * @template T
     * @param {string} type
     * @return {*}  {(T[] | null)}
     * @memberof ViewManager
     */
    public GetArrayByType<T>(type: string): T[] | null {
        try {
            let coms: T[] = new Array<T>();
            this.views.forEach(com => {
                coms.push(com as unknown as T);
            });

            return coms;
        } catch (err) {
            console.error("ViewManager: GetArrayByType() -> Could not get any views of type <" + type + ">!\n" + 
            "### ERROR:\n" + err);
            return null;
        }
    }
    //#endregion

    //#region CRUD Ops
    /**
     * Create a new view into view manager for the specified name and type.
     *
     * @param {string} name
     * @param {string} type
     * @return {*}  {string}
     * @memberof ViewManager
     */
    public Create(name: string, type: string): string {
        try {
            if (this.views.has(name)) {
                console.error("ViewManager: Create() -> Could not create view [" + name + "] of type <" + (this.views.get(name) as IGameView).type + ">!\n" + 
                "A view with that name already exists. Expected type was <" + type + ">.");
                return JSON.stringify({ viewName: name, code: "exists" });
            }

            let view: any;

            try {
                view = require(this.viewDir + "/" + type + ".js");
            } catch (err) {
                try {
                    view = require(__dirname + "/../game-views/types/" + type + ".js");
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

            this.views.set(name, view.Create(name, GameCore.game.gameLogic));
            return JSON.stringify({ viewName: name, code: "created" });
        } catch (err) {
            console.error("ViewManager: Create() -> Could not create view [" + name + "] of type <" + type + ">!\n" + 
            "Ensure you did not mistype the string for the <type> parameter. Also make sure the view type being referenced \n" + 
            "exists under './views/*.ts' and not in a different folder as well as not in a subfolder.\n" + 
            "### ERROR:\n" + err);
            return JSON.stringify({ viewName: name, code: "error" });
        }
    }

    /**
     * Add an externally created view.
     *
     * @param {IGameView} view
     * @return {*}  {boolean}
     * @memberof ViewManager
     */
    public Add(view: IGameView): boolean {
        try {
            if (this.views.has(view.name)) {
                console.error("ViewManager: Add() -> Could not add view [" + view.name + "] of type <" + view.type + ">!\n" + 
                "A view with that name already exists.");
                return false;
            }

            this.views.set(view.name, view);
            return true;
        } catch (err) {
            console.error("ViewManager: Add() -> Could not add view [" + view.name + "] of type <" + view.type + ">!\n" + 
            "### ERROR:\n" + err);
            return false;
        }
    }

    /**
     * Remove a view from the active views.
     *
     * @param {string} name
     * @return {*}  {boolean}
     * @memberof ViewManager
     */
    public Remove(name: string): boolean {
        try {
            if (!this.views.has(name)) {
                console.error("ViewManager: Remove() -> Could not remove view [" + name + "]!\n" + 
                "A view with that name does not exist.");
                return false;
            }

            return this.views.delete(name);
        } catch (err) {
            console.error("ViewManager: Remove() -> Could not remove view [" + name + "]!\n" + 
            "### ERROR:\n" + err);
            return false;
        }
    }

    /**
     * Clear all views. (Make sure they are all shutdown.)
     *
     * @return {*}  {void}
     * @memberof ViewManager
     */
    public Clear(): void {
        if (this.views.size > 0) {
            this.views.clear();
            return;
        }

        console.warn("ViewManager: Remove() -> No views to clear! I'm empty!");
    }
    //#endregion

    //#region Control Methods
    /**
     * Initialize or re-initialize applicable views.
     *
     * @memberof ViewManager
     */
    public Init(): void {
        if (this.views.size > 0) {
            this.views.forEach(vu => {
                if (vu.VIsReInit() === true) {
                    if (!vu.VInit()) {
                        console.error("ViewManager: Init() -> could not initialize view [" + vu.name + "] of type <" + vu.type + ">!");
                    }
                }
            });
        }
    }

    /**
     * Frame update of all initialized and updatable views.
     *
     * @memberof ViewManager
     */
    public Update(): void {
        if (this.views.size > 0) {
            this.views.forEach(vu => {
                try {
                    // If updating is supposed to be manual...
                    if (vu.autoUpdate === false) {
                        // ...Skip this view.
                        return;
                    }
                    
                    if (vu.VIsInitialized()) {
                        vu.VUpdate();
                    }
                } catch (err) {
                    console.error("ViewManager: Update() -> could not update view [" + vu.name + "] of type <" + vu.type + ">!\n" + 
                    "### ERROR:\n" + err);
                }
            });
        }
    }

    /**
     * Shutdown an unused view.
     *
     * @memberof ViewManager
     */
    public Shutdown(): void {
        if (this.views.size > 0) {
            this.views.forEach(vu => {
                try {
                    if (vu.VShutdownRequested() === true) {
                        vu.VShutdown();
                    }
                } catch (err) {
                    console.error("ViewManager: Shutdown() -> could not shutdown view [" + vu.name + "] of type <" + vu.type + ">!\n" + 
                    "### ERROR:\n" + err);
                }
            });
        }
    }
    //#endregion
}
