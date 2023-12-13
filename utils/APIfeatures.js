class APIfeatures {
  static features(queryString, Model) {
    let query = Model.find();
    if (queryString.sort) {
      query = query.sort(queryString.sort);
    }
    if (queryString.fields) {
      const fieldsList = queryString.fields.split(",");
      query = query.select(fieldsList);
    }
    if (queryString.page || queryString.limit) {
      const limited = queryString.limit * 1 || 9;

      const skip = (queryString.page * 1 - 1) * limited;

      query = query.skip(skip).limit(limited);
    }
    return query;
  }
}
module.exports = APIfeatures;
