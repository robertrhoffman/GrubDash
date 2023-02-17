const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function list(req, res) {
    res.json({ data: orders })
}

function orderExists(req, res, next) {
    const { orderId } = req.params
    const foundOrder = orders.find((order) => order.id == orderId);
    if (foundOrder) {
        res.locals.order = foundOrder;
        next();
    }
    next({
        status: 404,
        message: `Order with id ${orderId} does not exist`,
    });
};


function create(req, res, next) {
    const { data: { deliverTo, mobileNumber, status, dishes, quantity } = {} } = req.body

    const newOrder = {
        id: orders.length + 1,
        deliverTo,
        mobileNumber,
        status,
        dishes,
        quantity,
    }

    if (!deliverTo) {
        return next({
            status: 400,
            message: `deliverTo is empty ${req.params.orderId}`
        })
    }
    if (!mobileNumber) {
        return next({
            status: 400,
            message: `mobileNumber is empty ${req.params.orderId}`
        });
    }

    if (!dishes || dishes.length === 0 || !Array.isArray(dishes)) {
        return next({
            status: 400,
            message: `There are no dishes ${req.params.orderId}`
        });
    }

    for (let i = 0; i < dishes.length; i++) {
        if (!dishes[i].quantity || dishes[i].quantity < 0 || typeof dishes[i].quantity !== "number") {
            return next({
                status: 400,
                message: `Dish ${i} must have a quantity that is an integer greater than 0`
            })
        }
    }
//     if (!quantity) {
//         return next({
//             status: 400,
//             message: "quantity is required"
//         })
//     }

    orders.push(newOrder)
    res.status(201).json({ data: newOrder })
}


function read(req, res, next) {
    const { orderId } = req.params
    const findOrder = orders.find(order => order.id === orderId)
    res.json({ data: findOrder })
}

function update(req, res, next) {
    const foundOrder = res.locals.order;
    const { data: { deliverTo, mobileNumber, dishes, quantity, status, id, price} = {} } = req.body;
    
    if (id && id != req.params.orderId) {
      return next({
        status: 400,
        message: `id does not match route id. Order: ${id}, Route: ${req.params.orderId}.`,
      });
    }
    if (!mobileNumber) {
      return next({
        status: 400,
        message: `mobileNumber is empty ${req.params.orderId}`,
      });
    }
    if (!deliverTo) {
      return next({
        status: 400,
        message: `deliverTo is empty ${req.params.orderId}`,
      });
    }
    if (!dishes || !Array.isArray(dishes) || dishes.length === 0) {
      return next({
        status: 400,
        message: `There are no dishes ${req.params.orderId}`,
      }); 
    }
    if (status === "invalid" || !status) {
      return next({
        status: 400,
        message: `status is invalid ${req.params.orderId}`,
      });
    }
    
      for (let i = 0; i < dishes.length; i++) {
      if (!dishes[i].quantity || dishes[i].quantity < 0 || typeof dishes[i].quantity !== "number") {
        return next({
          status: 400,
          message:  `Dish ${i} must have a quantity that is an integer greater than 0`,
      });
      }
    }
    foundOrder.deliverTo = deliverTo
    foundOrder.mobileNumber = mobileNumber
    foundOrder.dishes = dishes
    foundOrder.quantity = quantity
  
    res
      .json({
        data: foundOrder
      })
  }
  

function destroy(req, res, next) {
    const { orderId } = req.params.orderId
    if (res.locals.order.status !== "pending") {
        return next({
            status: 400,
            message: "An order cannot be deleted unless it is pending"
        })
    } else {
        if (!res.locals.order) {
            return next({
                status: 404,
                message: "No mactching order has been found"
            })
        }
    }
    const index = orders.findIndex(order => order.id === orderId)
    const deletedOrders = orders.splice(index, 1)
    res.sendStatus(204)
}


module.exports = {
    create: [create],
    list,
    read: [orderExists, read],
    update: [orderExists, update],
    destroy: [orderExists, destroy]
}
