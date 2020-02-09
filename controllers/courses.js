const Course = require("../models/Course");
const Bootcamp = require("../models/Bootcamp");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");

//@desc   Get Courses
//@route  GET /api/v1/courses
//@route  GET /api/v1/bootcamps/:bootcampId/courses
//@access Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const courses = await Course.find({ bootcamp: req.params.bootcampId });
    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

//@desc   Get Single Course
//@route  GET /api/v1/courses/:id
//@access Public
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await await Course.findById(req.params.id);
  if (!course) {
    return next(
      new ErrorResponse(`Course not found with the ID of ${req.params.id}`, 404)
    );
  }
  course.populate({
    path: "bootcamp",
    select: "name description"
  });
  res.status(200).json({
    success: true,
    data: course
  });
});

//@desc   Add a Course
//@route  POST /api/v1/bootcamps/:bootcampId/courses
//@access Private
exports.addCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);
  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `Bootcamp not found with the ID of ${req.params.bootcampId}`,
        404
      )
    );
  }
  //Make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User with the ID of ${req.user.id} is not authorized add a course to this bootcamp`,
        403
      )
    );
  }
  const course = await Course.create(req.body);

  res.status(200).json({
    success: true,
    data: course
  });
});

//@desc   Update a Course
//@route  PUT /api/v1/courses/:id
//@access Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);
  if (!course) {
    return next(
      new ErrorResponse(`Course not found with the ID of ${req.params.id}`, 404)
    );
  }

  //Make sure user is bootcamp owner
  if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User with the ID of ${req.user.id} is not authorized update a course for this bootcamp`,
        403
      )
    );
  }
  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  res.status(200).json({
    success: true,
    data: course
  });
});

//@desc   Delete a Course
//@route  DELETE /api/v1/courses/:id
//@access Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);
  if (!course) {
    return next(
      new ErrorResponse(`Course not found with the ID of ${req.params.id}`, 404)
    );
  }
  //Make sure user is bootcamp owner
  if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User with the ID of ${req.user.id} is not authorized delete a course for this bootcamp`,
        403
      )
    );
  }
  course.remove();
  res.status(200).json({
    success: true,
    data: {}
  });
});
