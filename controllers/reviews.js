const Bootcamp = require("../models/Bootcamp");
const Review = require("../models/Review");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");

//@desc   Get Reviews
//@route  GET /api/v1/reviews
//@route  GET /api/v1/bootcamps/:bootcampId/reviews
//@access Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const reviews = await Review.find({ bootcamp: req.params.bootcampId });
    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

//@desc   Get a single Reviews
//@route  GET /api/v1/reviews/:id
//@access Public
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description"
  });
  if (!review) {
    return next(
      new ErrorResponse(`Review not found with the ID ${req.params.id}`, 404)
    );
  }
  return res.status(200).json({
    success: true,
    data: review
  });
});

//@desc   Add a Review
//@route  POST /api/v1/bootcamps/:bootcampId/reviews
//@access Private
exports.addReview = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);
  if (!bootcamp)
    return next(
      new ErrorResponse(`Bootcamp not found with ID ${req.params.bootcampId}`)
    );

  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const review = await Review.create(req.body);
  res.status(201).json({
    success: true,
    data: review
  });
});

//@desc   Update a Review
//@route  PUT /api/v1/reviews/:id
//@access Private
exports.updateReview = asyncHandler(async (req, res, next) => {
  const { title, text, rating } = req.body;
  let review = await Review.findById(req.params.id);
  if (!review)
    return next(
      new ErrorResponse(`Rating with the ID of ${req.params.id} not found`, 404)
    );
  if (req.user.id !== review.user.toString() && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User with the ID of ${req.user.id} does not have the permission to update this review`,
        403
      )
    );
  }
  review.title = title;
  review.text = text;
  review.rating = rating;

  review = await review.save();

  res.status(200).json({
    success: true,
    data: review
  });
});

//@desc   Delete a Review
//@route  DELETE /api/v1/reviews/:id
//@access Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);
  if (!review)
    return next(
      new ErrorResponse(`Rating with the ID of ${req.params.id} not found`, 404)
    );
  if (req.user.id !== review.user.toString() && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User with the ID of ${req.user.id} does not have the permission to update this review`,
        403
      )
    );
  }
  await review.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});
