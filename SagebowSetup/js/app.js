$(document).ready(function(){
    //For when a user already exists.
    //var displayModal = modalGenerator( "modal-user-exists", "btn-internal-user-exists" );

    //For when an internal server error was encountered.
    //var displayModal = modalGenerator( "modal-internal-error", "btn-internal-error-close" );


    //For when user has not entered complete data (maybe call this from the front end?
    var displayModal = modalGenerator( "modal-incomplete-data", "btn-incomplete-data-close" );

    var genderDropdown = DropdownGenerator("btn-gender", "gender-selector");

    genderDropdown.setMode( "replace" );
    genderDropdown.pushItem( "dropdown-female" );
    genderDropdown.pushItem( "dropdown-male" );
    genderDropdown.buildButton();

    //displayModal.display();
});

