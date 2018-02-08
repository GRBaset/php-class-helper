export class Support {

    constructor(
        public visibility?: boolean,
        public properties?: boolean
    ) { }

    public setVisibilty(visibility: boolean) {
        this.visibility = visibility;
    }

    public setProperties(properties: boolean) {
        this.properties = properties;
    }
}
