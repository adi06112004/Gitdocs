import mongoose from "mongoose";

const commitSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    type: {
      type: String,
      enum: ["create", "update", "delete", "commit", "sync"],
      default: "commit",
      index: true,
    },
    projectId: {
      type: String,
      required: true,
      index: true,
    },
    documentId: {
      type: String,
      required: true,
      index: true,
    },
    branch: {
      type: String,
      required: true,
      index: true,
    },
    author: {
      type: String,
      required: true,
    },
    parentCommit: {
      type: String,
      default: null,
    },
    snapshot: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

commitSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});

const Commit = mongoose.models.Commit || mongoose.model("Commit", commitSchema);
export default Commit;