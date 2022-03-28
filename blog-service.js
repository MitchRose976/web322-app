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
  category: Sequelize.STRING,
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
        resolve(data);
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
        resolve(data);
      })
      .catch(() => {
        resolve("no results returned");
      });
  });
};

const getPostsByCategory = (category) => {
  return new Promise((resolve, reject) => {
    Post.findAll({
        where: {
            categories: category
        }
    })
      .then((data) => {
        resolve(data);
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
        resolve(data);
      })
      .catch(() => {
        resolve("no results returned");
      });
  });
};

const getPostById = (id) => {
  return new Promise((resolve, reject) => {
    Post.findOne({
        where: {
            id: id
        }
    })
      .then((data) => {
        resolve(data);
      })
      .catch(() => {
        reject("no results returned");
      });
  });
};

const addPost = (postData) => {
  return new Promise((resolve, reject) => {
    postData.published = postData.published ? true : false;
    for (const key in postData) {
      if (postData[key] == "") {
        postData[key] = null;
      }
    }
    postData.postDate = new Date();
    Post.create(postData)
      .then(() => {
        resolve(postData);
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
        resolve(data);
      })
      .catch(() => {
        resolve("no results returned");
      });
  });
};

const getCategories = () => {
    return new Promise((resolve, reject) => {
      Category.findAll().then((data) => {
          resolve(data);
        }).catch(() => {
          reject("no results returned");
        });
    });
  };

const addCategory = (categoryData) => {
  //categoryData.published = (categoryData.published) ? true : false;
  //categoryData.title == "" ? categoryData.title = null : categoryData.title = categoryData.title;
  //categoryData.postDate == "" ? categoryData.postDate = null : categoryData.postDate = categoryData.postDate;
  //categoryData.featureImage == "" ? categoryData.featureImage = null : categoryData.featureImage = categoryData.featureImage;
  return new Promise((resolve, reject) => {
    for (const key in categoryData) {
      if (categoryData[key] == "") {
        categoryData[key] = null;
      }
    }
    //categoryData.postDate = new Date();
    Category.create(categoryData)
      .then(() => {
        resolve(categoryData);
      })
      .catch(() => {
        reject("unable to create post");
      });
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
  getPostById,
  getPublishedPostsByCategory,
  addCategory,
  deleteCategoryById,
  deletePostById,
};
