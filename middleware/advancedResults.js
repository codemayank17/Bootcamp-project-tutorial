const advancedResults = (model, populate) => async (req, res, next) => {
  let query;
  //copy query
  const reqQuery = { ...req.query };
  //remove mongoose query fields from query
  const removeFields = ["select", "sort", "limit", "page"];
  removeFields.forEach(param => delete reqQuery[param]);

  let queryStr = JSON.stringify(reqQuery);
  //replace lte with $lte, etc for query in mongoose
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  query = model.find(JSON.parse(queryStr));

  //add select parameter coming in query -- make it from name,desc to name desc
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }
  //add sort parameter coming in query
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }
  //pagination
  //current page
  const page = parseInt(req.query.page, 10) || 1;
  //values per page
  const limit = parseInt(req.query.limit) || 25;
  //first value index
  const startIndex = (page - 1) * limit;
  //last value index
  const endIndex = page * limit;
  //total docs
  const total = await model.countDocuments();

  query = query.skip(startIndex).limit(limit);
  if (populate) {
    query = query.populate(populate);
  }
  const results = await query;

  const pagination = {};
  //if more values are left then next page will be page + 1
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  //if its not the first page then prev page will be page - 1
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results
  };
  next();
};

module.exports = advancedResults;
