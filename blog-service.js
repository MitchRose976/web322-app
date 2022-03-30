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
  published: Sequelize.BOOLEAN
});

let Category = sequelize.define("Category", {
  category: Sequelize.STRING
});

Post.belongsTo(Category, { foreignKey: "category" });

const initialize = () => {
  return new Promise((resolve, reject) => {
    sequelize
      .sync()
      .then(() => {
        resolve("successfully synced database");
      })
      .catch((err) => {
        console.log(err);
        reject("unable to sync the database");
      });
  });
};

const getAllPosts = () => {
  return new Promise((resolve, reject) => {
    Post.findAll({})
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
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
      .catch((err) => {
        console.log(err);
        resolve("no results returned");
      });
  });
};

const getCategories = () => {
    return new Promise((resolve, reject) => {
      Category.findAll({}).then((data) => {
          resolve(data);
        }).catch((err) => {
          console.log(err);
          reject("no results returned", err);
        });
    });
  };

  const addPost = (postData) => {
    return new Promise((resolve, reject) => {
      postData.published = postData.published ? true : false;
      for (let key in postData) {
        if (postData[key] == "") {
          postData[key] = null;
        }
      }
      postData.postDate = new Date();
      Post.create({
          body: postData.body, 
          title: postData.title,
          postDate: postData.postDate,
          featureImage: postData.featureImage,
          published: postData.published,
          category: postData.category
      }) 
        .then(() => {
          resolve("Post created");
        })
        .catch(() => {
          reject("unable to create post");
        });
    });
  };

const getPostsByCategory = (category) => {
  return new Promise((resolve, reject) => {
    Post.findAll({
        where: {
            category: category
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
        resolve(data[0]);
      })
      .catch(() => {
        reject("no results returned");
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



const addCategory = (categoryData) => {
  return new Promise((resolve, reject) => {
    for (let key in categoryData) {
      if (categoryData[key] == "") {
        categoryData[key] = null;
      }
    }
    console.log(categoryData);
    //categoryData.postDate = new Date();
    Category.create({
        category: categoryData.category
    }) 
      .then(() => {
        resolve("Category created successfully");
      })
      .catch((err) => {
        console.log(err);
        reject("unable to create Category");
      });
  });
};



const deleteCategoryById = (id) => {
  return new Promise((resolve, reject) => {
    Category.destroy({
        where:{
            id: id
        }
    })
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
    Post.destroy({
        where: {
            id: id
        }
    })
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
