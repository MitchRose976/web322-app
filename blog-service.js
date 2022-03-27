const Sequelize = require("sequelize");
const { gte } = Sequelize.Op;

var sequelize = new Sequelize(
  "dnqau549k20hl",
  "gksneepywwrpue",
  "6078ca045f922bc11ab9bdb807d9c541ec7bdc210b7c26a132b7099fc44b2e2a",
  {
    host: "ec2-18-215-96-22.compute-1.amazonaws.com",
    dialect: "postgres",
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
    query: { raw: true },
  }
);

// Data Models
let Post = sequelize.define("Post", {
  body: Sequelize.TEXT,
  title: Sequelize.STRING,
  postDate: Sequelize.DATE,
  featureImage: Sequelize.STRING,
  published: Sequelize.BOOLEAN,
});

let Category = sequelize.define("Category", {
  body: Sequelize.STRING,
});

Post.belongsTo(Category, { foreignKey: "category" });

const initialize = () => {
  return new Promise((resolve, reject) => {
    sequelize
      .sync()
      .then(() => {
        resolve("successfully synced database");
      })
      .catch(() => {
        reject("unable to sync the database");
      });
  });
};

const getAllPosts = () => {
  return new Promise((resolve, reject) => {
    Post.findAll()
      .then((data) => {
        resolve("successfully found all posts: ", data);
      })
      .catch(() => {
        reject("no results returned");
      });
  });
};

const getPublishedPosts = () => {
  return new Promise((resolve, reject) => {
    Post.findAll({
      where: {
        postDate: {
          [gte]: { published: true },
        },
      },
    })
      .then((data) => {
        resolve("successfully found all posts", data);
      })
      .catch(() => {
        resolve("no results returned");
      });
  });
};

const getPostsByCategory = (category) => {
  return new Promise((resolve, reject) => {
    Post.findAll({ category: category })
      .then((data) => {
        resolve("successfully found all posts: ", data);
      })
      .catch(() => {
        reject("no results returned");
      });
  });
};

const getPostsByMinDate = (minDateStr) => {
  return new Promise((resolve, reject) => {
    Post.findAll({
      where: {
        postDate: {
          [gte]: new Date(minDateStr),
        },
      },
    })
      .then((data) => {
        resolve("successfully found all posts", data);
      })
      .catch(() => {
        resolve("no results returned");
      });
  });
};

const getPostsById = (id) => {
  return new Promise((resolve, reject) => {
    Post.findAll({ id: id })
      .then((data) => {
        resolve("successfully found all posts matching ID: ", data[0]);
      })
      .catch(() => {
        reject("no results returned");
      });
  });
};

const getCategories = () => {
  return new Promise((resolve, reject) => {
    Category.findAll()
      .then((data) => {
        resolve("successfully found all posts matching ID: ", data);
      })
      .catch(() => {
        reject("no results returned");
      });
  });
};

const addPost = (postData) => {
  return new Promise((resolve, reject) => {
    postData.published = postData.published ? true : false;
    postData.body == ""
      ? (postData.body = null)
      : (postData.body = postData.body);
    postData.title == ""
      ? (postData.title = null)
      : (postData.title = postData.title);
    postData.postDate == ""
      ? (postData.postDate = null)
      : (postData.postDate = postData.postDate);
    postData.featureImage == ""
      ? (postData.featureImage = null)
      : (postData.featureImage = postData.featureImage);
    for (const key in postData) {
      if (key == "") {
        key = null;
      }
    }
    postData.postDate = new Date();
    Post.create(postData)
      .then(() => {
        resolve("successfully added post to DB: ", postData);
      })
      .catch(() => {
        reject("unable to create post");
      });
  });
};

const getPublishedPostsByCategory = (category) => {
  return new Promise((resolve, reject) => {
    Post.findAll({
      where: {
        postDate: {
          [gte]: { published: true, category: category },
        },
      },
    })
      .then((data) => {
        resolve("successfully found all posts", data);
      })
      .catch(() => {
        resolve("no results returned");
      });
  });
};

const addCategory = (categoryData) => {
  //categoryData.published = (categoryData.published) ? true : false;
  categoryData.body == ""
    ? (categoryData.body = null)
    : (categoryData.body = categoryData.body);
  //categoryData.title == "" ? categoryData.title = null : categoryData.title = categoryData.title;
  //categoryData.postDate == "" ? categoryData.postDate = null : categoryData.postDate = categoryData.postDate;
  //categoryData.featureImage == "" ? categoryData.featureImage = null : categoryData.featureImage = categoryData.featureImage;
  for (const key in categoryData) {
    if (key == "") {
      key = null;
    }
  }
  //categoryData.postDate = new Date();
  Category.create(categoryData)
    .then(() => {
      resolve("successfully added post to DB: ", categoryData);
    })
    .catch(() => {
      reject("unable to create post");
    });
};

const deleteCategoryById = (id) => {
  return new Promise((resolve, reject) => {
    Category.destroy(id)
      .then(() => {
        resolve("successfully deleted data");
      })
      .catch(() => {
        resolve("no results returned");
      });
  });
};

const deletePostById = (id) => {
  return new Promise((resolve, reject) => {
    Post.destroy(id)
      .then(() => {
        resolve("successfully deleted data");
      })
      .catch(() => {
        resolve("no results returned");
      });
  });
};

module.exports = {
  initialize,
  getAllPosts,
  getPublishedPosts,
  getCategories,
  addPost,
  getPostsByCategory,
  getPostsByMinDate,
  getPostsById,
  getPublishedPostsByCategory,
  addCategory,
  deleteCategoryById,
  deletePostById,
};
