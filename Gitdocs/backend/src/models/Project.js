import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      default: "",
      maxlength: 500,
    },
    owner: {
      type: String,
      required: true,
      index: true,
    },
    branches: {
      type: [String],
      default: ["main"],
    },
    currentBranch: {
      type: String,
      default: "main",
    },
    collaborators: [
      {
        userId: {
          type: String,
          required: true,
          index: true,
        },
        permission: {
          type: String,
          enum: ["read", "write", "admin"],
          default: "read",
        },
      },
    ],
    isPublic: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

projectSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});

const Project = mongoose.models.Project || mongoose.model("Project", projectSchema);
export default Project;