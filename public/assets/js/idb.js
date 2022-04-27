let db;
const request = indexedDB.open('pizza_hunt', 1);

request.onupgradeneeded = function(e) {
    const db = e.target.result;
    db.createObjectStore('new_pizza', { autoIncrement: true });
}

request.onsuccess = function(e) {
    db = e.target.result;

    if (navigator.onLine) {
        uploadPizza();
    }
};

request.onerror = function(e) {
    console.log(e.target.errorCode);
}

function saveRecord(record) {
    const transaction = db.transaction(['new_pizza'], 'readwrite');
    const pizzaObjectStore = transaction.objectStore('new_pizza');

    pizzaObjectStore.add(record);
}

function uploadPizza() {
    const transaction = db.transaction(['new_pizza'], 'readwrite');
    const pizzaObjectStore = transaction.objectStore('new_pizza');

    const getAll = pizzaObjectStore.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch('/api/pizzas', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(res => res.json())
                .then(serverRes => {
                    if (serverRes.message) {
                        throw new Error(serverRes);
                    }

                    const transaction = db.transaction(['new_pizza'], 'readwrite');
                    const pizzaObjectStore = transaction.objectStore('new_pizza');
                    
                    pizzaObjectStore.clear();

                    alert('All saved pizza has been submitted!');
                })
                .catch(err => {
                    console.log(err);
                })
        }
    }
}

window.addEventListener('online', uploadPizza);