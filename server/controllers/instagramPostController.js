const path = require("path");

const {
  generateInstagramPost,
  listRecentInstagramPosts,
  resolveGeneratedInstagramPath,
} = require("../services/instagramPostGeneratorService");

const generateAdminInstagramPost = async (req, res) => {
  const result = await generateInstagramPost(req.body);

  res.status(201).json(result);
};

const getRecentAdminInstagramPosts = async (_req, res) => {
  const posts = await listRecentInstagramPosts();

  res.json({ posts });
};

const downloadAdminInstagramPost = async (req, res) => {
  const filePath = await resolveGeneratedInstagramPath(req.params.filename);
  const filename = path.basename(filePath);

  res.setHeader("Cache-Control", "private, no-store");
  res.download(filePath, filename);
};

module.exports = {
  downloadAdminInstagramPost,
  generateAdminInstagramPost,
  getRecentAdminInstagramPosts,
};
