
# Smartcar - Experience Team - Back-End Coding Challenge

Your local car sharing company is looking to create an application that can help them manage the vehicles and the customers who rent the vehicles. Their application will need to be able to do the following:
1. Create and get a vehicle, driver and trip
2. Return a list of active vehicles on the road and their driver


## Deployment

To deploy this project, clone repo and execute:

```bash
  npm install
  npm start
```

For unit and integration testing, clone repo and execute:
```bash
  npm install
  npm test
```

## API Reference

#### Get vehicle

```http
  GET /vehicles/${id}
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id`      | `int` | **Required**. Id of vehicle to fetch |

#### Get driver

```http
  GET /drivers/${id}
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id`      | `int` | **Required**. Id of driver to fetch |

#### Get trip

```http
  GET /trips/${id}
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id`      | `int` | **Required**. Id of trip to fetch |

#### Filter trips *(Pass filters using query parameters in URL)*

```http
  GET /trips/?status=active|inactive
```
| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `status`      | `int` | Filter by status of trip |
| `startedAt`      | `date` | Filter by startedAt of trip |
| `expectedReturn`      | `date` | Filter by expectedReturn of trip |

```http
  POST /vehicles
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `make` | `string` | **Required**. Make of the car to be created |

```http
  POST /drivers
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `driverName` | `string` | **Required**. Name of the driver to be created |

```http
  POST /trips
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `driverId` | `int` | **Required**. Id of driver assigned to trip |
| `vehicleId` | `int` | **Required**. Id of vehicle assigned to trip |
| `startedAt` | `date` | **Required**. Start time of trip |
| `expectedReturn` | `date` | **Required**. Expected return of vehicle |
| `status` | `string` | Current status of trip (active or inactive) |

```http
  PUT /trips
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `tripId` | `int` | **Required**. Id of trip to be updated |
| `startedAt` | `date` | Start time of trip |
| `expectedReturn` | `date` | Expected return of vehicle |
| `status` | `string` | Current status of trip (active or inactive) |

#### Delete vehicle

```http
  GET /vehicles/${id}
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id`      | `int` | **Required**. Id of vehicle to delete |


#### Delete driver

```http
  GET /drivers/${id}
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id`      | `int` | **Required**. Id of driver to delete |

#### Delete trip

```http
  GET /trips/${id}
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id`      | `int` | **Required**. Id of trip to delete |

## Usage/Examples

***POST /vehicles***

*Input*
```json
{
    make: "Honda",
}
```

*Output*
```json

{
    id: 1,
    make: "Honda",
}
```
***GET /vehicles/1***

*Output*
```json
{
    id: 1,
    make: "Honda",
}
```

***POST /drivers***

*Input*
```json
{
    driverName: "John Doe",
}
```

*Output*
```json

{
    id: 1,
    driverName: "John Doe",
}
```
***GET /driver/1***

*Output*
```json
{
    id: 1,
    driverName: "John Doe",
}
```

***POST /trips***

*Input*
```json
{

    vehicleId: 1,
    driverId: 1,
    startedAt: "2022-02-24T14:43:18-08:00",
    expectedReturn: "2022-03-24T14:43:18-08:00",
}
```

*Output*
```json

{
    id: 1,
    startedAt: "2022-02-24T14:43:18-08:00",
    expectedReturn: "2022-03-24T14:43:18-08:00",
    status: "active",
    driver: {
        driverId: 1,
        driverName: "John Doe",
    },
    vehicle: {
        vehicleId: 1,
        make: "Honda",
    },
}
```
***GET /trips/1***

*Output*
```json
{
    id: 1,
    startedAt: "2022-02-24T14:43:18-08:00",
    expectedReturn: "2022-03-24T14:43:18-08:00",
    status: "active",
    driver: {
        driverId: 1,
        driverName: "John Doe",
    },
    vehicle: {
        vehicleId: 1,
        make: "Honda",
    },
}
```

***PUT /trips***

*Input*
```json
{

    tripId: 1,
    status: "inactive"
}
```

*Output*
```json

{
    id: 1,
    startedAt: "2022-02-24T14:43:18-08:00",
    expectedReturn: "2022-03-24T14:43:18-08:00",
    status: "inactive",
    driver: {
        driverId: 1,
        driverName: "John Doe",
    },
    vehicle: {
        vehicleId: 1,
        make: "Honda",
    },
}
```



