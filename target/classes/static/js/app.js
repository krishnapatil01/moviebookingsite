// CineMatch App Service Logic
class CineMatch {
    constructor() {
        this.apiBase = '/api';
        this.selectedMovieId = null;
        this.movies = []; // Store fetched movies
        this.weights = {
            price: 0.8,
            ambiance: 0.5,
            seatComfort: 0.7,
            avQuality: 0.9,
            foodQuality: 0.3
        };
        this.init();
    }

    async init() {
        this.setupListeners();
        await this.loadMovies();
    }

    setupListeners() {
        const themeBtn = document.getElementById('theme-toggle');
        const currentTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', currentTheme);
        this.updateThemeIcon(currentTheme);
        this.initLocationSelector();

        themeBtn.addEventListener('click', () => {
            let theme = document.documentElement.getAttribute('data-theme');
            let newTheme = theme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            this.updateThemeIcon(newTheme);
        });

        const weightInputs = ['w-price', 'w-ambiance', 'w-comfort', 'w-av', 'w-food'];
        weightInputs.forEach(id => {
            document.getElementById(id).addEventListener('input', (e) => {
                const key = id.split('-')[1];
                this.weights[key === 'comfort' ? 'seatComfort' : key === 'av' ? 'avQuality' : key === 'food' ? 'foodQuality' : key] = e.target.value / 100;
            });
        });

        const applyFiltersBtn = document.getElementById('apply-filters-btn');
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', () => {
                if (this.selectedMovieId) {
                    this.refreshRecommendations();
                    setTimeout(() => {
                        document.getElementById('recommended-shows').scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                } else {
                    alert('Please select a movie first!');
                }
            });
        }
    }

    async loadMovies() {
        const grid = document.getElementById('movie-grid');
        grid.innerHTML = '';
        try {
            const response = await fetch(`${this.apiBase}/movies`);
            this.movies = await response.json();
            
            this.movies.forEach(movie => {
                const card = this.createMovieCard(movie);
                grid.appendChild(card);
            });
        } catch (error) {
            console.error('Failed to load movies:', error);
            grid.innerHTML = '<p style="color:red">Error connecting to server. Is it running?</p>';
        }
    }

    initLocationSelector() {
        const selector = document.getElementById('location-selector');
        const dropdown = document.getElementById('location-dropdown');
        const stateSelect = document.getElementById('state-select');
        const citySelect = document.getElementById('city-select');

        const locationData = {
            "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik"],
            "Karnataka": ["Bangalore", "Mysore", "Hubballi", "Mangalore"],
            "Delhi": ["New Delhi", "Dwarka", "Saket"],
            "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
            "Telangana": ["Hyderabad", "Warangal", "Nizamabad"],
            "Gujarat": ["Ahmedabad", "Surat", "Vadodara"]
        };

        stateSelect.innerHTML = Object.keys(locationData).map(state => `<option value="${state}">${state}</option>`).join('');
        const updateCities = (state) => {
            citySelect.innerHTML = locationData[state].map(city => `<option value="${city}">${city}</option>`).join('');
        };
        updateCities(stateSelect.value);
        stateSelect.onchange = (e) => updateCities(e.target.value);

        selector.onclick = (e) => {
            if (e.target.id === 'location-selector' || e.target.id === 'current-location' || e.target.className.includes('fa-map-marker-alt')) {
                dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
            }
        };

        window.confirmLocation = () => {
            const city = citySelect.value;
            document.getElementById('current-location').innerText = city;
            dropdown.style.display = 'none';
            if (this.selectedMovieId) this.refreshRecommendations();
        };
    }

    updateThemeIcon(theme) {
        const icon = document.querySelector('#theme-toggle i');
        if (theme === 'light') icon.className = 'fas fa-sun';
        else icon.className = 'fas fa-moon';
    }

    createMovieCard(movie) {
        const div = document.createElement('div');
        div.className = 'movie-card';
        div.innerHTML = `
            <img src="${movie.posterUrl}" alt="${movie.title}" class="movie-poster">
            <div class="movie-info-layer">
                <span class="movie-tag">${movie.genre.split(',')[0]}</span>
                <h3>${movie.title}</h3>
                <div style="font-size:12px; color:var(--text-secondary)">
                    <i class="fas fa-star" style="color: var(--color-gold)"></i> ${movie.rating} | ${movie.duration}m
                </div>
            </div>
        `;
        div.onclick = () => this.showMovieInfo(movie.id);
        return div;
    }

    showMovieInfo(movieId) {
        const movie = this.movies.find(m => m.id == movieId);
        const infoSection = document.getElementById('selected-movie-info');
        
        infoSection.innerHTML = `
            <div class="glass-panel" style="display: flex; gap: 30px; padding: 40px; align-items: flex-start; position: relative;">
                <button onclick="cinematch.deselectMovie()" style="position: absolute; top: 20px; right: 20px; background: none; border: none; color: var(--text-primary); font-size: 24px; cursor: pointer;">&times;</button>
                <img src="${movie.posterUrl}" style="width: 300px; border-radius: 12px; box-shadow: var(--card-shadow);">
                <div style="flex: 1;">
                    <h2 style="font-size: 48px; margin-bottom: 10px;">${movie.title}</h2>
                    <p style="color: var(--text-secondary); margin-bottom: 20px;">${movie.genre} | ${movie.language}</p>
                    <p style="margin-bottom: 30px; line-height: 1.6;">${movie.synopsis}</p>
                    <div style="display: flex; gap: 20px; margin-bottom: 40px;">
                        <div class="glass-panel" style="padding: 15px 30px; text-align: center;">
                            <small style="color: grey; display: block;">DURATION</small>
                            <strong>${movie.duration} min</strong>
                        </div>
                        <div class="glass-panel" style="padding: 15px 30px; text-align: center;">
                             <small style="color: grey; display: block;">RATING</small>
                            <strong><i class="fas fa-star" style="color: var(--color-gold);"></i> ${movie.rating}</strong>
                        </div>
                    </div>
                    <div style="display: flex; gap: 15px;">
                        <button class="btn-primary" id="final-select-btn" onclick="cinematch.confirmSelection(${movie.id})">SELECT THIS MOVIE</button>
                        <button class="glass-panel" style="border: none; padding: 12px 24px; color: var(--text-primary); font-weight: 600; cursor: pointer;" onclick="cinematch.deselectMovie()">CANCEL</button>
                    </div>
                </div>
            </div>
        `;
        infoSection.scrollIntoView({ behavior: 'smooth' });
    }

    confirmSelection(movieId) {
        this.selectedMovieId = movieId;
        const btn = document.getElementById('final-select-btn');
        btn.innerText = "SELECTED ✓";
        btn.style.background = "var(--success)";
        btn.disabled = true;
        
        document.getElementById('recommended-shows').innerHTML = `
            <div style="padding: 40px; text-align: center; width: 100%; border: 2px dashed var(--glass-border); border-radius: 16px; color: var(--text-secondary);">
                <i class="fas fa-sliders-h" style="font-size: 40px; margin-bottom: 20px;"></i>
                <h3>🎉 Movie Selected!</h3>
                <p style="margin-top: 10px;">Adjust your preferences and click "Apply Filters" to find theaters.</p>
            </div>
        `;

        setTimeout(() => {
            document.getElementById('recommendations').scrollIntoView({ behavior: 'smooth' });
        }, 500);
    }

    deselectMovie() {
        this.selectedMovieId = null;
        document.getElementById('selected-movie-info').innerHTML = '';
        document.getElementById('recommended-shows').innerHTML = `
            <div style="padding: 40px; text-align: center; width: 100%; border: 2px dashed var(--glass-border); border-radius: 16px; color: var(--text-secondary);">
                <h3>🎬 Select a Movie from the Grid Above</h3>
                <p style="margin-top: 10px;">Our AI will then rank theaters for you!</p>
            </div>
        `;
        document.getElementById('movie-discovery').scrollIntoView({ behavior: 'smooth' });
    }

    async refreshRecommendations() {
        if (!this.selectedMovieId) return;
        const recGrid = document.getElementById('recommended-shows');
        recGrid.innerHTML = '<div style="padding:24px; color:var(--accent);">AI Engine Calculating Best Match...</div>';
        const city = document.getElementById('current-location').innerText.trim();

        try {
            const response = await fetch(`${this.apiBase}/theaters/recommend/${this.selectedMovieId}?city=${city}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.weights)
            });
            const recommendations = await response.json();
            
            // Sort by price (Lowest to Highest)
            recommendations.sort((a, b) => a.show.basePrice - b.show.basePrice);
            
            recGrid.innerHTML = '';
            if (recommendations.length === 0) {
                recGrid.innerHTML = `
                    <div style="padding: 40px; text-align: center; width: 100%; border: 2px dashed var(--glass-border); border-radius: 16px; color: var(--text-secondary);">
                        <i class="fas fa-sad-tear" style="font-size: 40px; margin-bottom: 20px;"></i>
                        <h3>No shows found in ${city}</h3>
                        <p>Try switching to Mumbai or Pune for more options!</p>
                    </div>`;
                return;
            }
            recommendations.slice(0, 4).forEach((rec, index) => {
                const show = rec.show;
                const score = (rec.score * 10).toFixed(1);
                const isBestValue = index === 0;
                const card = document.createElement('div');
                card.className = 'glass-panel';
                card.style.padding = '24px';
                card.style.position = 'relative';
                card.innerHTML = `
                    ${isBestValue ? '<div style="position:absolute; top:-12px; left:20px; background:var(--color-gold); color:var(--bg-primary); padding:4px 12px; border-radius:12px; font-weight:800; font-size:12px;">BEST MATCH ★</div>' : ''}
                    <h3 style="color:var(--text-primary); margin-bottom:8px;">${show.theater.name}</h3>
                    <div style="color:var(--text-secondary); margin-bottom:12px; font-size:14px;">
                        <i class="fas fa-map-marker-alt"></i> ${show.theater.city}
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:16px;">
                        <span style="color:var(--accent); font-weight:800;">₹${show.basePrice}</span>
                        <span style="font-size:12px; color:var(--text-secondary);">Match Score: ${score}%</span>
                    </div>
                    <div style="display:flex; flex-direction:column; gap:8px;">
                        <small>Time: ${new Date(show.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                        <small>Seats Left: ${show.availableSeats}</small>
                    </div>
                    <button class="btn-primary" style="margin-top:20px; width:100%;" onclick="bookShow(${show.id}, '${show.theater.name}', ${show.basePrice})">Book Now</button>
                `;
                recGrid.appendChild(card);
            });
        } catch (error) { console.error('Recommendation failed:', error); }
    }
}

const app = new CineMatch();
window.cinematch = app;

let bookingState = {
    showId: null,
    selectedSeats: [],
    snacksTotal: 0,
    currentStep: 1,
    movie: null,
    theater: null,
    basePrice: 0
};

window.bookShow = async (showId, theaterName, price) => {
    // Restore payment grid to original state (fix for persisting spinner)
    if (!window.originalPaymentHTML) {
        window.originalPaymentHTML = document.querySelector('.payment-grid').innerHTML;
    } else {
        document.querySelector('.payment-grid').innerHTML = window.originalPaymentHTML;
    }
    
    // Reset email error
    const emailError = document.getElementById('email-error');
    if (emailError) emailError.style.display = 'none';

    // Fetch latest show data to get booked seats
    let bookedSeats = [];
    try {
        const response = await fetch(`/api/theaters/show/${showId}`);
        const showData = await response.json();
        if (showData.seatStatusMap) {
            bookedSeats = showData.seatStatusMap.split(',').map(s => s.trim());
        }
    } catch (e) {
        console.error("Failed to fetch show data:", e);
    }

    bookingState = {
        showId: showId,
        selectedSeats: [],
        snacksTotal: 0,
        currentStep: 1,
        movie: document.querySelector('#selected-movie-info h2')?.innerText || "Movie Title",
        theater: theaterName,
        basePrice: price
    };
    document.getElementById('booking-modal').style.display = 'block';
    updateSummary();
    renderSeats(bookedSeats);
    goToStep(1);
};

function renderSeats(bookedSeats = []) {
    const grid = document.getElementById('seat-grid-unified');
    grid.innerHTML = '';
    for (let i = 1; i <= 40; i++) {
        const seatId = 'S' + i;
        const isBooked = bookedSeats.includes(seatId);
        
        const seat = document.createElement('div');
        seat.className = isBooked ? 'glass-panel booked' : 'glass-panel';
        seat.style.cssText = `width:35px;height:35px;display:flex;align-items:center;justify-content:center;font-size:10px; ${isBooked ? 'cursor:not-allowed; opacity:0.5; background:var(--color-slate);' : 'cursor:pointer;'}`;
        seat.innerText = seatId;
        
        if (!isBooked) {
            seat.onclick = () => {
                if (bookingState.selectedSeats.includes(seatId)) {
                    bookingState.selectedSeats = bookingState.selectedSeats.filter(s => s !== seatId);
                    seat.style.background = 'var(--glass)';
                    seat.style.color = 'var(--text-primary)';
                } else {
                    bookingState.selectedSeats.push(seatId);
                    seat.style.background = 'var(--accent)';
                    seat.style.color = 'white';
                }
                updateSummary();
            };
        } else {
            seat.title = "Already Booked";
        }
        grid.appendChild(seat);
    }
}

window.goToStep = (step) => {
    if (step === 2 && bookingState.selectedSeats.length === 0) return alert('Please select at least one seat!');
    
    if (step === 3) {
        const email = document.getElementById('user-email').value;
        const errorEl = document.getElementById('email-error');
        // Regex: starts with small letter [a-z], then anything, ends with @gmail.com
        const emailRegex = /^[a-z][a-z0-9._%+-]*@gmail\.com$/;
        
        if (!emailRegex.test(email)) {
            errorEl.innerText = "The email address you entered is incorrect. Please rewrite it (must start with a small letter and end with @gmail.com).";
            errorEl.style.display = 'block';
            return;
        } else {
            errorEl.style.display = 'none';
        }
    }
    
    document.querySelectorAll('.booking-step').forEach(s => s.style.display = 'none');
    const stepIds = ['step-seats', 'step-verify', 'step-snacks', 'step-payment', 'step-ticket'];
    document.getElementById(stepIds[step-1]).style.display = 'block';
    document.querySelectorAll('.step-node').forEach((node, i) => {
        if (i + 1 <= step) node.classList.add('active');
        else node.classList.remove('active');
    });
    bookingState.currentStep = step;
};

window.addSnack = (price) => {
    bookingState.snacksTotal += price;
    updateSummary();
    alert('Snack added to your order!');
};

function updateSummary() {
    document.getElementById('sum-movie-title').innerText = bookingState.movie;
    document.getElementById('sum-theater-name').innerText = bookingState.theater;
    document.getElementById('sum-seats').innerText = bookingState.selectedSeats.join(', ') || 'None';
    document.getElementById('sum-snacks').innerText = `₹${bookingState.snacksTotal}`;
    const total = (bookingState.selectedSeats.length * bookingState.basePrice) + bookingState.snacksTotal;
    document.getElementById('sum-total').innerText = `₹${total}`;
}

window.processPayment = async (method) => {
    const total = (bookingState.selectedSeats.length * bookingState.basePrice) + bookingState.snacksTotal;
    
    // Visual feedback for processing
    const paymentGrid = document.querySelector('.payment-grid');
    const originalContent = paymentGrid.innerHTML;
    paymentGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
            <i class="fas fa-spinner fa-spin" style="font-size: 40px; color: var(--accent); margin-bottom: 20px;"></i>
            <h3>Processing ${method} Payment...</h3>
            <p style="color: var(--text-secondary); margin-top: 10px;">Please do not refresh the page.</p>
        </div>
    `;

    const payload = {
        showId: bookingState.showId,
        seats: bookingState.selectedSeats.join(','),
        seatCount: bookingState.selectedSeats.length
    };
    
    try {
        const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) throw new Error('Payment failed');
        
        const data = await response.json();
        setTimeout(() => showTicket(data), 1500); // Artificial delay for premium feel
    } catch (e) {
        console.error('Payment error:', e);
        // Fallback for demo purposes if API fails
        setTimeout(() => {
            showTicket({
                id: 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                seatsBooked: bookingState.selectedSeats.join(', '),
                status: 'CONFIRMED'
            });
        }, 1500);
    }
};

function showTicket(data) {
    document.getElementById('t-movie').innerText = bookingState.movie;
    document.getElementById('t-theater').innerText = bookingState.theater;
    document.getElementById('t-seats').innerText = data.seatsBooked;
    document.getElementById('t-id').innerText = data.id;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=CineMatch|${data.id}|${bookingState.movie}|${data.seatsBooked}`;
    document.querySelector('.qr-placeholder img').src = qrUrl;
    goToStep(5);
}

window.closeBooking = () => {
    document.getElementById('booking-modal').style.display = 'none';
    const container = document.getElementById('tickets-container');
    if (container.querySelector('p')) container.innerHTML = '';
    const ticketThumb = document.createElement('div');
    ticketThumb.className = 'glass-panel';
    ticketThumb.style.cssText = 'padding:15px; min-width:250px; cursor:pointer;';
    ticketThumb.innerHTML = `
        <h4 style="color:var(--accent);">${bookingState.movie}</h4>
        <small>Theater: ${bookingState.theater}</small><br>
        <small>Seats: ${bookingState.selectedSeats.join(', ')}</small>
        <div style="margin-top:10px; display:flex; justify-content:center;">
             <img src="https://api.qrserver.com/v1/create-qr-code/?size=80&data=${bookingState.movie}" style="background:white; padding:5px; border-radius:4px;">
        </div>
    `;
    ticketThumb.onclick = () => alert("Show the larger ticket modal again or scan this code at the theater!");
    container.appendChild(ticketThumb);
    bookingState.selectedSeats = [];
    bookingState.snacksTotal = 0;
    bookingState.showId = null;
    
    alert('Ticket saved to your dashboard! Enjoy the movie.');
};

document.querySelector('.close-booking-btn').onclick = () => {
    document.getElementById('booking-modal').style.display = 'none';
};

        document.getElementById('loginBtn').addEventListener('click', () => {
            alert("CineMatch Pro: Account management coming soon!");
        });

        const exploreBtn = document.querySelector('.hero .btn-primary');
        if (exploreBtn) {
            exploreBtn.addEventListener('click', () => {
                document.getElementById('movie-discovery').scrollIntoView({ behavior: 'smooth' });
            });
        }

        const closeBtn = document.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                document.getElementById('movie-modal').style.display = 'none';
            });
        }
window.scrollToMovies = () => document.getElementById('movie-discovery').scrollIntoView({ behavior: 'smooth' });
