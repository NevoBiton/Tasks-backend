function buildCriteria(query) {
    const criteria = {};

    if (query.name) {
      criteria.name = { $regex: query.name, $options: "i"}
    }
    if (query.minPrice) {
      criteria.price = { $gte: query.minPrice }
    }
    if (query.maxPrice) {
      if(!query.minPrice) {
        criteria.price = {}
      }
      criteria.price.$lte = query.maxPrice
    }
    if (query.inStock === "true") {
      criteria.quantity = { $gt: 0 };
    }
    return criteria
  }

  module.exports = { buildCriteria };