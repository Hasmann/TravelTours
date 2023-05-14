const { models } = require('mongoose');
const errorClass = require('./../errorClass.js');
const catchAsync = require('./../errorhandling');
const ApiFilters = require('./../util/ApiFilters.js');
exports.deleteOne = (model) =>
  catchAsync(async (req, res, next) => {
    const doc = await model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new errorClass(`CANNOT DELETE THIS Document `, 404));
    } else {
      res.status(204).json({
        status: 'Success',
        updData: {
          doc,
        },
      });
    }
  });

exports.create = (model) =>
  catchAsync(async (req, res, next) => {
    const doc = await model.create(req.body);

    if (!doc) {
      return next(new errorClass('CANNOT CREAT THIS Document', 404));
    }

    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.update = (model) =>
  catchAsync(async (req, res, next) => {
    const doc = await model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new errorClass(`CANNOT PATCH THIS DOCUMENT`, 404));
    }
    res.status(200).json({
      status: 'Success',
      Data: {
        doc,
      },
    });
  });

exports.readOne = (model, populateOption) =>
  catchAsync(async (req, res, next) => {
    let query = model.findById(req.params.id);
    if (populateOption) {
      query = model.findById(req.params.id).populate(populateOption);
    }
    const doc = await query;

    if (!doc) {
      return next(new errorClass('CANNOT RETRIEVE THIS DOCUMENT', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.readAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on tour (hack)
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new ApiFilters(Model.find(filter), req.query)
      .filter()
      .sort()
      .fields()
      .paginate();
    // const doc = await features.query.explain();
    const doc = await features.query;

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });
