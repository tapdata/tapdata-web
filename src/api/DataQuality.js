import PublicAPI from "./publicApi";

export default class DataQualityAPI extends PublicAPI {
  constructor() {
    super("/api/DataCatalogs");
  }
}
