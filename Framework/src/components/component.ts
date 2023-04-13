/** @module components/component */

/**
 * The base component class. Components like the renderer inherit this class.
 *
 * @export
 * @class Component
 */
export class Component {
    //#region Fields
    /**
     * Component name (key) for look up in component manager.
     *
     * @protected
     * @type {string}
     * @memberof Component
     */
    protected name: string = "component";
    /**
     * Component type. Multiple components can be retreived from component manager with GetArrayByType().
     *
     * @protected
     * @type {string}
     * @memberof Component
     */
    protected type: string = "component";
    /**
     * True if initialized, false otherwise.
     *
     * @protected
     * @type {boolean}
     * @memberof Component
     */
    protected isInitialized: boolean = false;
    /**
     * If reInit is true, the component may have new resources to initialize so componenet manager will know to initialize again.
     *
     * @protected
     * @type {boolean}
     * @memberof Component
     */
    protected reInit: boolean = true;
    /**
     * If true, resources are freed and the component is uninitialized. It still exists in component manager for later initialization.
     *
     * @protected
     * @type {boolean}
     * @memberof Component
     */
    protected requestShutdown: boolean = false;
    //#endregion
    
    /**
     * Creates an instance of Component.
     * @param {string} name
     * @param {string} type
     * @memberof Component
     */
    constructor(name: string, type: string) {
        this.name = name;
        this.type = type;
    }

    //#region Accessors
    /**
     * Returns whether or not this component is initialized.
     *
     * @readonly
     * @type {boolean}
     * @memberof Component
     */
    public get IsInitialized(): boolean {
        return this.isInitialized;
    }

    /**
     * Returns whether or not this component needs to be reinitialized
     *
     * @readonly
     * @type {boolean}
     * @memberof Component
     */
    public get ReInit(): boolean {
        return this.reInit;
    }
    /**
     * This will mark the component in component manager for reinitialization.
     *
     * @memberof Component
     */
    public ReInitialize(): void {
        this.reInit = true;
        this.isInitialized = false;
    }

    /**
     * Returns if the component has been marked for shutdown.
     *
     * @return {*}  {boolean}
     * @memberof Component
     */
    public ShutdownRequested(): boolean {
        return this.requestShutdown;
    }

    /**
     * Marks the component for shutdown.
     *
     * @memberof Component
     */
    public RequestShutdown(): void {
        this.requestShutdown = true;
    }
    //#endregion

    //#region Control Method Overrides
    // Core functions.
    /**
     * Initialize the component and mark it as initialized if successful.
     * This is an override
     *
     * @return {*}  {boolean}
     * @memberof Component
     */
    public VInit(): boolean {
        this.reInit = false;
        return this.isInitialized;
    }

    /**
     * If Initialized, run the update function.
     * This is an override
     *
     * @memberof Component
     */
    public VUpdate(): void {
        if (!this.isInitialized) {
            console.error("Component: VUpdate() -> Component not initialized! Could not update component [" + this.name + "] of type <" + this.type + ">.");
        }
    }

    /**
     * This is only called by component manager if requestShutdown === true
     * This is an override
     *
     * @memberof Component
     */
    public VShutdown(): void {
        this.isInitialized = false;
        this.requestShutdown = false;
    }
    // END OVERRIDES
    //#endregion

    //#region Name and Type retrieval functions
    /**
     * Returns the set name of this component.
     *
     * @return {*}  {string}
     * @memberof Component
     */
    public VGetName(): string {
        return this.name;
    }

    /**
     * Returns the set sub-type of this component.
     *
     * @return {*}  {string}
     * @memberof Component
     */
    public VGetType(): string {
        return this.type;
    }
    //#endregion
}