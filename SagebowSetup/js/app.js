$(document).ready(function(){
    //For when a user already exists.
    //var displayModal = modalGenerator( "modal-user-exists", "btn-internal-user-exists" );

    //For when an internal server error was encountered.
    //var displayModal = modalGenerator( "modal-internal-error", "btn-internal-error-close" );


    //For when user has not entered complete data (maybe call this from the front end?
    var displayModal = Modal( "modal-incomplete-data", "btn-incomplete-data-close" );

    var genderDropdown = Dropdown( "btn-gender", "gender-selector" );
    genderDropdown.setMode( "replace" );
    genderDropdown.pushItem( "dropdown-female" );
    genderDropdown.pushItem( "dropdown-male" );
    genderDropdown.buildButton( );

    var goalDropdown = Dropdown( "btn-goal", "goal-selector" );
    goalDropdown.setMode( "replace" );
    goalDropdown.pushItem( "dropdown-weight-loss" );
    goalDropdown.pushItem( "dropdown-maintainence" );
    goalDropdown.pushItem( "dropdown-bodybuilding" );
    goalDropdown.buildButton( );

    //displayModal.display();
});

