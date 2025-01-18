// Helper function for pagination
export const paginate = async ({
  model,
  query = {},
  page = 1,
  limit = 10,
  sort = { createdAt: -1 },
  populateOptions = [],
  select = [],
}) => {
  const skip = (page - 1) * limit;

  let queryBuilder = model
    .find(query)
    .skip(skip)
    .limit(limit)
    .sort(sort)
    .select(select);

  populateOptions.forEach((option) => {
    queryBuilder = queryBuilder.populate(option);
  });

  const documents = await queryBuilder;

  const totalCount = await model.countDocuments(query);
  const totalPages = Math.ceil(totalCount / limit);

  return {
    documents,
    pagination: {
      totalCount,
      totalPages,
      currentPage: Number(page),
      perPage: Number(limit),
    },
  };
};
