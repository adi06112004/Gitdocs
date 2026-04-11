import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      default: "",
    },
    projectId: {
      type: String,
      default: "",
      index: true,
    },
    projectName: {
      type: String,
      default: "",
    },
    branch: {
      type: String,
      required: true,
      default: "main",
      index: true,
    },
    createdBy: {
      type: String,
      default: "",
    },
    lastEditedBy: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

documentSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});

const Document = mongoose.models.Document || mongoose.model("Document", documentSchema);
export default Document;