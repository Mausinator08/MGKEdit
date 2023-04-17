/** @module components/component-manager */

//#region Imports
import { Component } from "./component";
//#endregion

/**
 * Maneges components at the system level such as for rendering.
 *
 * @export
 * @class ComponentManager
 */
export class ComponentManager {
    //#region fields
    /**
     * Key/Value pairs list of components.
     *
     * @private
     * @type {Map<string, Component>}
     * @memberof ComponentManager
     */
    private components: Map<string, Component>;
    /**
     * Points to the external game's component directory.
     *
     * @type {string}
     * @memberof ComponentManager
     */
    public comDir: string;
    //#endregion
    
    //#region Properties    
    /**
     * Returns the number of components in the component list.
     *
     * @readonly
     * @memberof ComponentManager
     */
    public get count() {
        return this.components.size;
    }
    //#endregion

    /**
     * Creates an instance of ComponentManager.
     * @param {string} comPath
     * @memberof ComponentManager
     */
    constructor(comPath: string) {
        this.components = new Map<string, Component>();
        this.comDir = comPath;
    }

    //#region Accessors
    /**
     * Get one component by name.
     *
     * @template T
     * @param {string} name
     * @return {*}  {(T | null)}
     * @memberof ComponentManager
     */
    public GetByName<T>(name: string): T | null {
        try {
            if (!this.components.has(name)) {
                console.error("ComponentManager: GetByName() -> Could not get component [" + name + "]! A component with that name does not exist.");
                return null;
            }

            return this.components.get(name) as unknown as T;
        } catch (err) {
            console.error("ComponentManager: GetByName() -> Could not get component [" + name + "]!\n" + 
            "### ERROR:\n" + err);
            return null;
        }
    }

    /**
     * Get one or more components by type.
     *
     * @template T
     * @param {string} type
     * @return {*}  {(T[] | null)}
     * @memberof ComponentManager
     */
    public GetArrayByType<T>(type: string): T[] | null {
        try {
            let coms: T[] = new Array<T>();
            this.components.forEach(com => {
                coms.push(com as unknown as T);
            });

            return coms;
        } catch (err) {
            console.error("ComponentManager: GetArrayByType() -> Could not get any components of type <" + type + ">!\n" + 
            "### ERROR:\n" + err);
            return null;
        }
    }
    //#endregion

    //#region CRUD Ops
    /**
     * Create a new empty component of a certain type.
     *
     * @param {string} name
     * @param {string} type
     * @param {Map<string, string>} args
     * @return {*}  {string}
     * @memberof ComponentManager
     */
    public Create(name: string, type: string, args: Map<string, string> = new Map<string, string>()): string {
        try {
            if (this.components.has(name)) {
                console.error("ComponentManager: Create() -> Could not create component [" + name + "] of type <" + this.components.get(name).VGetType() + ">!\n" + 
                "A component with that name already exists. Expected type was <" + type + ">.");
                return JSON.stringify({ comName: name, code: "exists" });
            }

            let com: any;

            try {
                com = require(this.comDir + "/" + type + ".js");
            } catch (err) {
                try {
                    com = require(__dirname + "/../components/" + type + ".js");
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

            this.components.set(name, com.Create(name, args));
            return JSON.stringify({ comName: name, code: "created" });
        } catch (err) {
            console.error("ComponentManager: Create() -> Could not create component [" + name + "] of type <" + type + ">!\n" + 
            "Ensure you did not mistype the string for the <type> parameter. Also make sure the component type being referenced \n" + 
            "exists under './components/*.ts' and not in a different folder as well as not in a subfolder.\n" + 
            "### ERROR:\n" + err);
            return JSON.stringify({ comName: name, code: "error" });
        }
    }

    /**
     * Add an externally created component.
     *
     * @param {Component} component
     * @return {*}  {boolean}
     * @memberof ComponentManager
     */
    public Add(component: Component): boolean {
        try {
            if (this.components.has(component.VGetName())) {
                console.error("ComponentManager: Add() -> Could not add component [" + component.VGetName() + "] of type <" + component.VGetType() + ">!\n" + 
                "A component with that name already exists.");
                return false;
            }

            this.components.set(component.VGetName(), component);
            return true;
        } catch (err) {
            console.error("ComponentManager: Add() -> Could not add component [" + component.VGetName() + "] of type <" + component.VGetType() + ">!\n" + 
            "### ERROR:\n" + err);
            return false;
        }
    }

    /**
     * Remove a component by name.
     *
     * @param {string} name
     * @return {*}  {boolean}
     * @memberof ComponentManager
     */
    public Remove(name: string): boolean {
        try {
            if (!this.components.has(name)) {
                console.error("ComponentManager: Remove() -> Could not remove component [" + name + "]!\n" + 
                "A component with that name does not exist.");
                return false;
            }

            return this.components.delete(name);
        } catch (err) {
            console.error("ComponentManager: Remove() -> Could not remove component [" + name + "]!\n" + 
            "### ERROR:\n" + err);
            return false;
        }
    }

    /**
     * Clear all components.
     * Be careful with this. Make sure all components have been properly shutdown.
     *
     * @return {*}  {void}
     * @memberof ComponentManager
     */
    public Clear(): void {
        if (this.components.size > 0) {
            this.components.clear();
            return;
        }

        console.warn("ComponentManager: Remove() -> No components to clear! I'm empty!");
    }
    //#endregion

    //#region Control Methods
    /**
     * Initialize all components that have not been initialized or need to be reinitialized
     *
     * @memberof ComponentManager
     */
    public Init(): void {
        if (this.components.size > 0) {
            this.components.forEach(com => {
                if (com.ReInit === true) {
                    if (!com.VInit()) {
                        console.error("ComponentManager: Init() -> could not initialize component [" + com.VGetName() + "] of type <" + com.VGetType() + ">!");
                    }
                }
            });
        }
    }

    /**
     * Update all initialized components.
     *
     * @memberof ComponentManager
     */
    public Update(): void {
        if (this.components.size > 0) {
            this.components.forEach(com => {
                try {
                    if (com.IsInitialized) {
                        com.VUpdate();
                    }
                } catch (err) {
                    console.error("ComponentManager: Update() -> could not update component [" + com.VGetName() + "] of type <" + com.VGetType() + ">!\n" + 
                    "### ERROR:\n" + err);
                }
            });
        }
    }

    /**
     * Shutdown components marked for termination.
     *
     * @memberof ComponentManager
     */
    public Shutdown(): void {
        if (this.components.size > 0) {
            this.components.forEach(com => {
                try {
                    if (com.ShutdownRequested() === true) {
                        com.VShutdown();
                    }
                } catch (err) {
                    console.error("ComponentManager: Shutdown() -> could not shutdown component [" + com.VGetName() + "] of type <" + com.VGetType() + ">!\n" + 
                    "### ERROR:\n" + err);
                }
            });
        }
    }
    //#endregion
}
