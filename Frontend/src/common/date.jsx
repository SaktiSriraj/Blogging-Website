let months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"]
let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export const getDay = (timestamp) => {
    let date = new Date(timestamp);

    return `${date.getDate()}-${months[date.getMonth()]}-${(date.getFullYear()) % 1000}`
}
