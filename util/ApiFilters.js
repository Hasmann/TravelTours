module.exports = class ApiFilters {
  constructor(query, querystr) {
    this.query = query;
    this.querystr = querystr;
  }

  filter() {
    // console.log(req.query);
    const que = { ...this.querystr };
    console.log(que);
    const notREADY = ['page', 'sort', 'limit', 'fields'];

    for (const k of notREADY) {
      delete que[k];
    }
    // 1B)BETTER FILTERING OF THE ARRAY
    let querStr = JSON.stringify(que);
    querStr = querStr.replace(/\b(lt|lte|gt|gte)\b/g, (match) => `$${match}`);
    console.log(querStr);

    this.query = this.query.find(JSON.parse(querStr));

    return this;
  }
  sort() {
    if (this.querystr.sort) {
      const sorting = this.querystr.sort.split(',').join(' ');
      this.query = this.query.sort(sorting);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  fields() {
    if (this.querystr.fields) {
      const selectFields = this.querystr.fields.replaceAll(',', ' ');
      console.log(selectFields);
      this.query = this.query.select(selectFields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }
  paginate() {
    const page = this.querystr.page * 1 || 1;
    const limit = this.querystr.limit * 1 || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
};
