// Your code here
document.addEventListener('DOMContentLoaded', () => {
    // Fetching the first film's details when the page loads
    fetch('http://localhost:3000/films/1')
    .then(response => response.json())
    .then(data => {
        // Destructure the response data
        const { poster, title, runtime, showtime, tickets_sold, capacity, description } = data;

        // Calculate the number of available tickets
        const availableTickets = capacity - tickets_sold;

        // Select elements from the DOM
        const filmInfoElement = document.getElementById('film-info');
        const posterElement = document.getElementById('poster');
        const titleElement = document.getElementById('title');
        const runtimeElement = document.getElementById('runtime');
        const showtimeElement = document.getElementById('showtime');
        const availableTicketsElement = document.getElementById('ticket-num');

        // Update the DOM with movie details
        filmInfoElement.textContent = description;  // Update with movie description
        posterElement.src = poster;  // Update poster image
        titleElement.textContent = title;  // Update title
        runtimeElement.textContent = `${runtime} minutes`;  // Update runtime
        showtimeElement.textContent = showtime;  // Update showtime
        availableTicketsElement.textContent = availableTickets;  // Display the number of available tickets
    })
    .catch(error => {
        console.error('Error fetching the film details:', error);  // Log errors
    });
});
document.addEventListener('DOMContentLoaded', () => {
    const filmsList = document.getElementById('films');
    const buyButton = document.getElementById('buy-ticket');
    const filmInfoElement = document.getElementById('film-info');
    const posterElement = document.getElementById('poster');
    const titleElement = document.getElementById('title');
    const runtimeElement = document.getElementById('runtime');
    const showtimeElement = document.getElementById('showtime');
    const availableTicketsElement = document.getElementById('ticket-num');

    //  populating the menu
    fetch('http://localhost:3000/films')
        .then(response => response.json())
        .then(films => {
            filmsList.innerHTML = ''
            films.forEach(film => {
                const liElement = document.createElement('li');
                liElement.classList.add('film', 'item');
                liElement.textContent = film.title;
                liElement.dataset.filmId = film.id;

                
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.className = 'ui red button';
                deleteButton.onclick = () => deleteFilm(film.id, liElement);
                liElement.appendChild(deleteButton);

                //  is sold out
                if (film.capacity - film.tickets_sold === 0) {
                    liElement.classList.add('sold-out');
                }

                filmsList.appendChild(liElement);
            });

            // Automatically load the first film's details when the page loads
            if (films.length > 0) {
                loadFilmDetails(films[0].id);
            }
        })
        .catch(error => console.error('Error fetching films:', error));

    // Load film details when a film is selected from the menu
    filmsList.addEventListener('click', (event) => {
        const clickedElement = event.target;
        if (clickedElement.tagName === 'LI' && clickedElement.classList.contains('film')) {
            const filmId = clickedElement.dataset.filmId;
            loadFilmDetails(filmId);
        }
    });

    // Function to load and display a specific film's details
    function loadFilmDetails(filmId) {
        fetch(`http://localhost:3000/films/${filmId}`)
            .then(response => response.json())
            .then(film => {
                const availableTickets = film.capacity - film.tickets_sold;

                // Update the DOM with film details
                posterElement.src = film.poster;
                titleElement.textContent = film.title;
                runtimeElement.textContent = `${film.runtime} minutes`;
                showtimeElement.textContent = film.showtime;
                availableTicketsElement.textContent = availableTickets;
                filmInfoElement.textContent = film.description;

                // Handle "Buy Ticket" button status
                if (availableTickets === 0) {
                    buyButton.textContent = 'Sold Out';
                    buyButton.disabled = true;
                } else {
                    buyButton.textContent = 'Buy Ticket';
                    buyButton.disabled = false;

                    // Handle ticket purchase when clicked
                    buyButton.onclick = () => {
                        if (availableTickets > 0) {
                            purchaseTicket(film);
                        }
                    };
                }
            })
            .catch(error => console.error('Error fetching film details:', error));
    }

    // Function to purchase a ticket for the selected film
    function purchaseTicket(film) {
        const newTicketsSold = film.tickets_sold + 1;
        fetch(`http://localhost:3000/films/${film.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ tickets_sold: newTicketsSold })
        })
            .then(response => response.json())
            .then(updatedFilm => {
                const availableTickets = updatedFilm.capacity - updatedFilm.tickets_sold;

                // Update the available tickets and check if it's sold out
                availableTicketsElement.textContent = availableTickets;
                if (availableTickets === 0) {
                    buyButton.textContent = 'Sold Out';
                    buyButton.disabled = true;

                    // Mark the film as sold out in the films list
                    const selectedFilm = document.querySelector(`[data-film-id="${updatedFilm.id}"]`);
                    selectedFilm.classList.add('sold-out');
                }
            })
            .catch(error => console.error('Error purchasing ticket:', error));
    }

    // Function to delete a film
    function deleteFilm(filmId, liElement) {
        fetch(`http://localhost:3000/films/${filmId}`, {
            method: 'DELETE',
        })
            .then(response => {
                if (response.ok) {
                    liElement.remove(); // Remove the film from the UI
                    console.log('Film deleted successfully');
                } else {
                    console.error('Error deleting film:', response.statusText);
                }
            })
            .catch(error => console.error('Error deleting film:', error));
    }
});


