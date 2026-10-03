/* =========================================================================
   1. CONFIGURATION
   Yahan aapki Google Sheet ID automatically link ho gayi hai
========================================================================= */
const CONFIG = {
    siteName: "My Notes & Resources",
    
    // Aapki Google Sheet ki ID
    sheetId: "1RzZkw3LiC0ICwT-Gmp47potgY0OvWw2-iC9XsDeSNNQ", 
    sheetName: "Sheet1", // Agar aapki sheet ka naam alag hai niche tabs me to yahan change karein
    
    // 6 steps ke timer seconds
    stepDurations: [30, 30, 30, 30, 30, 30], 
    
    // Yahan apni pasand ki categories add ya remove kar sakte hain
    categories: ["All", "Class 10", "Class 12", "Apps", "Notes"],
    
    // Ye array ab automatic Google Sheet se bharega
    resources: [] 
};

/* =========================================================================
   2. APPLICATION LOGIC (Iske niche kuch change karne ki zarurat nahi)
========================================================================= */
const app = {
    state: {
        currentView: 'home', // home, flow, final
        activeResource: null,
        flowStep: 1,
        timeRemaining: 0,
        timerInterval: null
    },

    async init() {
        // Set dynamic texts
        document.getElementById('site-title').textContent = CONFIG.siteName;
        document.getElementById('footer-site-name').textContent = CONFIG.siteName;
        document.getElementById('year').textContent = new Date().getFullYear();

        // UI Setup
        this.populateCategories();
        this.setupEventListeners();
        
        // Google Sheet se data fetch karna
        await this.loadDataFromSheet();

        // Refresh protection check
        this.checkSavedFlow();
    },

    async loadDataFromSheet() {
        const grid = document.getElementById('resources-grid');
        grid.innerHTML = '<p style="text-align:center; width:100%; font-size:1.2rem; margin-top:20px;">Fetching resources from Google Sheet... Please wait.</p>';

        try {
            // Free API jo public google sheet ko JSON fetch karti hai
            const url = `https://opensheet.elk.sh/${CONFIG.sheetId}/${CONFIG.sheetName}`;
            const response = await fetch(url);
            
            if(!response.ok) throw new Error("Sheet load nahi ho paayi.");
            
            const data = await response.json();
            CONFIG.resources = data; // Data array me save ho gaya
            this.renderResources(CONFIG.resources);
        } catch (error) {
            console.error("Sheet Error:", error);
            grid.innerHTML = '<p style="text-align:center; color:red; width:100%;">Data load hone me error aa raha hai. Kripya check karein ki Google Sheet "Anyone with the link" (Public) par set hai ya nahi.</p>';
        }
    },

    setupEventListeners() {
        document.getElementById('search-input').addEventListener('input', (e) => this.filterResources());
        document.getElementById('category-filter').addEventListener('change', (e) => this.filterResources());
        
        document.getElementById('btn-continue').addEventListener('click', () => this.nextStep());
    },

    populateCategories() {
        const select = document.getElementById('category-filter');
        select.innerHTML = ''; // clear
        CONFIG.categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            select.appendChild(option);
        });
    },

    renderResources(resourcesToRender) {
        const grid = document.getElementById('resources-grid');
        grid.innerHTML = ''; // clear

        if(!resourcesToRender || resourcesToRender.length === 0) {
            grid.innerHTML = '<p style="text-align:center; width:100%;">No resources found. Google Sheet me data add karein.</p>';
            return;
        }

        resourcesToRender.forEach(res => {
            // Agar id ya title blank hai toh skip karein (khali row na dikhe)
            if(!res.id || !res.title) return;

            const card = document.createElement('div');
            card.className = 'card';
            
            card.innerHTML = `
                <img src="${res.image || 'https://via.placeholder.com/400x200?text=No+Image'}" alt="${res.title}" class="card-img" loading="lazy">
                <div class="card-content">
                    <span class="card-category">${res.category || 'Uncategorized'}</span>
                    <h3 class="card-title">${res.title}</h3>
                    <p class="card-desc">${res.description || ''}</p>
                    <button class="btn-primary" onclick="app.startFlow('${res.id}')">Get Resource</button>
                </div>
            `;
            grid.appendChild(card);
        });
    },

    filterResources() {
        const query = document.getElementById('search-input').value.toLowerCase();
        const category = document.getElementById('category-filter').value;

        const filtered = CONFIG.resources.filter(res => {
            if(!res.title) return false;
            const matchesSearch = res.title.toLowerCase().includes(query) || (res.description && res.description.toLowerCase().includes(query));
            const matchesCat = category === 'All' || res.category === category;
            return matchesSearch && matchesCat;
        });

        this.renderResources(filtered);
    },

    switchView(viewId) {
        document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.view').forEach(el => el.classList.add('hidden'));
        
        const target = document.getElementById(`view-${viewId}`);
        target.classList.remove('hidden');
        target.classList.add('active');
        
        window.scrollTo(0, 0);
    },

    goHome() {
        clearInterval(this.state.timerInterval);
        localStorage.removeItem('savedFlow');
        this.switchView('home');
    },

    startFlow(resourceId) {
        const resource = CONFIG.resources.find(r => r.id === resourceId);
        if(!resource) return;

        this.state.activeResource = resource;
        this.state.flowStep = 1;
        this.state.timeRemaining = CONFIG.stepDurations[0];
        
        this.saveFlowState();
        this.renderFlowUI();
        this.switchView('flow');
    },

    checkSavedFlow() {
        const saved = localStorage.getItem('savedFlow');
        if (saved && CONFIG.resources.length > 0) {
            try {
                const parsed = JSON.parse(saved);
                const resourceExists = CONFIG.resources.find(r => r.id === parsed.resourceId);
                
                // Resume flow if valid
                if (resourceExists && parsed.step <= 6) {
                    this.state.activeResource = resourceExists;
                    this.state.flowStep = parsed.step;
                    this.state.timeRemaining = parsed.timeRemaining > 0 ? parsed.timeRemaining : CONFIG.stepDurations[parsed.step - 1];
                    
                    this.renderFlowUI();
                    this.switchView('flow');
                }
            } catch (e) {
                localStorage.removeItem('savedFlow');
            }
        }
    },

    saveFlowState() {
        if (!this.state.activeResource) return;
        const stateToSave = {
            resourceId: this.state.activeResource.id,
            step: this.state.flowStep,
            timeRemaining: this.state.timeRemaining
        };
        localStorage.setItem('savedFlow', JSON.stringify(stateToSave));
    },

    renderFlowUI() {
        clearInterval(this.state.timerInterval);

        // Update step UI
        document.getElementById('step-indicator').textContent = `Step ${this.state.flowStep} of 6`;
        document.getElementById('progress-bar').style.width = `${(this.state.flowStep / 6) * 100}%`;
        
        const btn = document.getElementById('btn-continue');
        btn.disabled = true;
        btn.textContent = "Please Wait...";

        this.updateTimerDisplay();
        
        // Start Interval
        this.state.timerInterval = setInterval(() => {
            this.state.timeRemaining--;
            this.updateTimerDisplay();
            this.saveFlowState(); // Save every second to survive refresh

            if(this.state.timeRemaining <= 0) {
                clearInterval(this.state.timerInterval);
                btn.disabled = false;
                btn.textContent = this.state.flowStep === 6 ? "Unlock Resource" : "Continue to Next Step";
            }
        }, 1000);
    },

    updateTimerDisplay() {
        document.getElementById('countdown-timer').textContent = Math.max(0, this.state.timeRemaining);
    },

    nextStep() {
        if (this.state.flowStep >= 6) {
            this.finishFlow();
        } else {
            this.state.flowStep++;
            this.state.timeRemaining = CONFIG.stepDurations[this.state.flowStep - 1] || 30;
            this.saveFlowState();
            this.renderFlowUI();
        }
    },

    finishFlow() {
        localStorage.removeItem('savedFlow');
        
        // Populate final view safely
        const res = this.state.activeResource;
        document.getElementById('final-image').src = res.image || 'https://via.placeholder.com/400x200?text=No+Image';
        document.getElementById('final-title').textContent = res.title;
        document.getElementById('final-desc').textContent = res.description || '';
        document.getElementById('btn-download').href = res.downloadUrl || '#';
        
        this.switchView('final');
    }
};

// Initialize App on DOM Load
document.addEventListener('DOMContentLoaded', () => app.init());
