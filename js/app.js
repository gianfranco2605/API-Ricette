function initApp() {

    const result = document.querySelector('#result');

    const selectCategories = document.querySelector('#categories');

    if(selectCategories) {

        selectCategories.addEventListener('change', selectCategory);

        getCategories()
    }
    const preferitiDiv = document.querySelector(".preferiti")
    if(preferitiDiv) {
        getPreferiti()
    }
    
    const modal = new bootstrap.Modal('#modal', {});

    


    function getCategories() {
        const url = 'https://www.themealdb.com/api/json/v1/1/categories.php'
        fetch(url)
            .then(response => response.json()
            
            )
            .then( result => showCategories(result.categories));
             
    }

    function showCategories(categories = []){
        categories.forEach( category => {
            const { strCategory } = category
            const option = document.createElement('OPTION');
            option.value = strCategory;
            option.textContent = strCategory;
            selectCategories.appendChild(option);
        })
    }

    // GET API

    function selectCategory(e) {
        const category = e.target.value;
        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`
        fetch(url)
            .then(response => response.json())
            .then(result => showRecipes(result.meals))



    }

    function showRecipes(recipes = []) {

         cleanHtml(result);

         const heading = document.createElement('H2');
         heading.classList.add('text-center', 'text-black', 'my-5');
         heading.textContent = recipes.length ? 'Ricette' : 'Non ci sono Ricette';
         result.appendChild(heading);
        
        recipes.forEach(recipe => {

            const { idMeal, strMeal, strMealThumb } = recipe;
           

            const recipeContainer = document.createElement('DIV');
            recipeContainer.classList.add('col-md-4');

            const recipeCard = document.createElement('DIV');
            recipeCard.classList.add('card', 'mb-4', 'shadow');

            const recipeImg = document.createElement('IMG');
            recipeImg.classList.add('card-img-top');
            recipeImg.alt = `Imagine ricetta ${strMeal ?? recipe.title}`;
            recipeImg.src = strMealThumb ?? recipe.img;

            const recipeCardBody = document.createElement('DIV');
            recipeCardBody.classList.add('card-body');

            const recipeHeading = document.createElement('H3');
            recipeHeading.classList.add('card-title', 'mb-3');
            recipeHeading.textContent = strMeal ?? recipe.title;

            const recipeButtom =document.createElement('BUTTOM');   
            recipeButtom.classList.add('btn', 'btn-danger', 'w-100');
            recipeButtom.textContent = 'Vedere Ricetta'
            recipeButtom.dataset.bsTarget = '#modal';
            recipeButtom.dataset.bsToggle = 'modal'
            recipeButtom.onclick = function() {
                selectRecipe(idMeal ?? recipe.id);
            }

            // Html injection
            recipeCardBody.appendChild(recipeHeading);
            recipeCardBody.appendChild(recipeButtom);

            recipeCard.appendChild(recipeImg);
            recipeCard.appendChild(recipeCardBody);

            recipeContainer.appendChild(recipeCard);

            result.appendChild(recipeContainer);

        
        })
    }

    function selectRecipe(id) {
        const url = `https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
        fetch(url) 
           .then(response => response.json())
           .then(result => showRecipeModal(result.meals[0]))

    }

    function showRecipeModal(recipe) {
        const { idMeal, strInstructions, strMeal, strMealThumb } = recipe;

        const modalTitle = document.querySelector('.modal .modal-title');
        const modalBody = document.querySelector('.modal .modal-body');

        modalTitle.textContent = strMeal;
        modalBody.innerHTML = `
                <img class="img-fluid" src="${strMealThumb}" alt="recipe ${strMeal}"/>
                <h3 class="my-3">Instruzioni</h3>
                <p>${strInstructions}</p>
                <h3 class="my-3">Ingradienti e Quantita</h3>
                `;
        const listGroup = document.createElement('UL');
        listGroup.classList.add('list-group');        

        for(let i = 1; i <= 20; i++) {
            if(recipe[`strIngredient${i}`]) {
                const ingrediente = recipe[`strIngredient${i}`];
                const quantita = recipe[`strMeasure${i}`];

                const ingredientiList = document.createElement("LI");
                ingredientiList.classList.add('list-group-item');
                ingredientiList.textContent = `${ingrediente} - ${quantita}`

                listGroup.appendChild(ingredientiList)
            }
        }

        modalBody.appendChild(listGroup);

        const modalFooter = document.querySelector('.modal-footer')

        cleanHtml(modalFooter);

        // BUTTONS 
        const btnPreferito = document.createElement('BUTTON');
        btnPreferito.classList.add('btn', 'btn-danger', 'col');
        btnPreferito.textContent = existStorage(idMeal) ? "Cancellare dai preferiti" : 'Salva Preferiti';
        
        // Save in local storage
        btnPreferito.onclick = function() { 
            
            if(existStorage(idMeal)) {
                cancelPreferito(idMeal);
                btnPreferito.textContent = "Salva Preferiti";
                showToast("Cancellato corretamente");
                return;
            };
            aggiungiPreferito({
            id: idMeal,
            title: strMeal,
            img: strMealThumb
            });
            btnPreferito.textContent = "Cancellare dai Preferiti"
            showToast("Aggiunto corretamente");
            
        };

        const btnClose = document.createElement('BUTTON');
        btnClose.classList.add('btn', 'btn-secondary', 'col');
        btnClose.textContent = 'Chiudere';
        btnClose.onclick = function() {
            modal.hide();
        };

        modalFooter.appendChild(btnPreferito);
        modalFooter.appendChild(btnClose);


        //Show Modal
        modal.show();

    };

    function aggiungiPreferito(recipe) {
        
        const preferiti = JSON.parse(localStorage.getItem("preferiti")) ?? [];
        localStorage.setItem('preferiti', JSON.stringify([...preferiti, recipe]));

        
    };

    function cancelPreferito (id) {
        const preferiti = JSON.parse(localStorage.getItem("preferiti")) ?? [];
        const newPreferiti = preferiti.filter( preferito => preferito.id !== id);
        localStorage.setItem('preferiti', JSON.stringify(newPreferiti) );
    };

    function existStorage(id) {
        const preferiti = JSON.parse(localStorage.getItem("preferiti")) ?? [];
        return preferiti.some(preferito => preferito.id === id);
    };

    function showToast(message) {
        const toastDiv = document.querySelector('#toast');
        const toastBody = document.querySelector(".toast-body");
        const toast = new bootstrap.Toast(toastDiv);
        toastBody.textContent = message;
        toast.show();
    }

    function getPreferiti() {
        const preferiti = JSON.parse(localStorage.getItem("preferiti")) ?? [];
        console.log(preferiti);
        if(preferiti.length) {

            showRecipes(preferiti);

            return;
        }

        const noPreferiti = document.createElement('P');
        noPreferiti.textContent = "Non ci sono Preferiti!"
        noPreferiti.classList.add('fs-4', 'text-center', 'text-info', 'font-bold', 'mt-5');
        preferitiDiv.appendChild(noPreferiti);
    }
    


    function cleanHtml(select) {
        while(select.firstChild) {
            select.removeChild(select.firstChild);
        }
    };

  
}
document.addEventListener('DOMContentLoaded', initApp);

