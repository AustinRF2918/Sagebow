import unittest
import time

from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.keys import Keys


driver = webdriver.Chrome('/usr/bin/chromedriver')
driver.set_window_size(900, 900)
driver.set_window_position(900, 0)



def ui_wait():
    time.sleep(0.4)
    

class TestIntroduction(unittest.TestCase):
    def setUp(self):
        driver.get("http://localhost:4001/login")
        driver.implicitly_wait(.5)

    def test_url(self):
        self.assertEqual('Welcome back to Sagebow.' in driver.page_source, True)
        self.assertEqual('Enter your username' in driver.page_source, True)
        self.assertEqual('Enter your password' in driver.page_source, True)
        self.assertEqual('Login' in driver.page_source, True)
        self.assertEqual('Create a new account' in driver.page_source, True)

    def test_no_data(self):
        driver.find_element_by_class_name('btn-login').click()
        ui_wait()
        self.assertEqual('Oops' in driver.page_source, True)

    def test_transition_to_setup(self):
        driver.find_element_by_class_name('btn-make-account').click()
        ui_wait()
        self.assertEqual('Sign Up' in driver.page_source, True)

    def test_bad_login(self):
        name = driver.find_element_by_id('username')
        password = driver.find_element_by_id('password')

        name.send_keys("gdsagdsagjkdksagjdk");
        password.send_keys("gdsagdsagjkdksagjdk");

        driver.find_element_by_class_name('btn-login').click()
        ui_wait()
        self.assertEqual('This username does not exist.' in driver.page_source, True)

    def test_bad_password(self):
        name = driver.find_element_by_id('username')
        password = driver.find_element_by_id('password')

        name.send_keys("boston");
        password.send_keys("gdsagdsagjkdksagjdk");

        driver.find_element_by_class_name('btn-login').click()
        ui_wait()

        self.assertEqual('The password you entered is incorrect.' in driver.page_source, True)

    def test_good_password(self):
        name = driver.find_element_by_id('username')
        password = driver.find_element_by_id('password')

        name.send_keys("boston");
        password.send_keys("password1");

        driver.find_element_by_class_name('btn-login').click()
        ui_wait()

        self.assertEqual('Entry' in driver.page_source, True)

    def test_modal_close_button(self):
        name = driver.find_element_by_id('username')
        password = driver.find_element_by_id('password')

        name.send_keys("boston");
        password.send_keys("gdsagdsagjkdksagjdk");

        driver.find_element_by_class_name('btn-login').click()
        ui_wait()
        self.assertEqual('The password you entered is incorrect.' in driver.page_source, True)

        driver.find_element_by_class_name('btn-reject').click()
        ui_wait()
        self.assertEqual('The password you entered is incorrect.' in driver.page_source, False)

    def test_modal_close_outside(self):
        name = driver.find_element_by_id('username')
        password = driver.find_element_by_id('password')

        name.send_keys("boston");
        password.send_keys("gdsagdsagjkdksagjdk");

        driver.find_element_by_class_name('btn-login').click()
        ui_wait()

        self.assertEqual('The password you entered is incorrect.' in driver.page_source, True)

        window = driver.find_element_by_class_name('window')
        action = webdriver.common.action_chains.ActionChains(driver)
        action.move_to_element_with_offset(window, -150, -150) 
        action.click()
        action.perform()
        ui_wait()

        self.assertEqual('Oops' in driver.page_source, False)

    def test_modal_not_close_inside(self):
        name = driver.find_element_by_id('username')
        password = driver.find_element_by_id('password')

        name.send_keys("boston");
        password.send_keys("gdsagdsagjkdksagjdk");

        driver.find_element_by_class_name('btn-login').click()
        ui_wait()

        self.assertEqual('The password you entered is incorrect.' in driver.page_source, True)

        window = driver.find_element_by_class_name('window')
        action = webdriver.common.action_chains.ActionChains(driver)
        action.move_to_element_with_offset(window, 150, 150) 
        action.click()
        action.perform()
        ui_wait()


        self.assertEqual('Oops' in driver.page_source, True)

    def test_modal_open_enter(self):
        name = driver.find_element_by_id('username')
        password = driver.find_element_by_id('password')
        login = driver.find_element_by_class_name('btn-login')
        page = driver.find_element_by_class_name('full-container')
        account_creation = driver.find_element_by_class_name('btn-make-account')

        name.send_keys("boston");
        password.send_keys("gdsagdsagjkdksagjdk");

        password.send_keys(Keys.ENTER);
        ui_wait()
        self.assertEqual('The password you entered is incorrect.' in driver.page_source, True)
        driver.find_element_by_class_name('btn-reject').click()
        ui_wait()

        name.send_keys(Keys.ENTER);
        ui_wait()
        self.assertEqual('The password you entered is incorrect.' in driver.page_source, True)
        driver.find_element_by_class_name('btn-reject').click()
        ui_wait()

        login.send_keys(Keys.ENTER);
        ui_wait()
        self.assertEqual('The password you entered is incorrect.' in driver.page_source, True)
        driver.find_element_by_class_name('btn-reject').click()
        ui_wait()

        account_creation.send_keys(Keys.ENTER);
        ui_wait()
        self.assertEqual('Sign Up' in driver.page_source, True)
        ui_wait()

    def test_modal_close_enter_from_enter(self):
        name = driver.find_element_by_id('username')
        password = driver.find_element_by_id('password')
        login = driver.find_element_by_class_name('btn-login')
        page = driver.find_element_by_class_name('full-container')
        account_creation = driver.find_element_by_class_name('btn-make-account')

        name.send_keys("boston");
        password.send_keys("gdsagdsagjkdksagjdk");
        password.send_keys(Keys.ENTER);

        ui_wait()
        self.assertEqual('The password you entered is incorrect.' in driver.page_source, True)
        action = webdriver.common.action_chains.ActionChains(driver)
        action.send_keys(Keys.ENTER)
        action.perform()
        self.assertEqual('The password you entered is incorrect.' in driver.page_source, False)
        ui_wait()

    def test_modal_close_enter_from_click(self):
        name = driver.find_element_by_id('username')
        password = driver.find_element_by_id('password')
        login = driver.find_element_by_class_name('btn-login')
        page = driver.find_element_by_class_name('full-container')
        account_creation = driver.find_element_by_class_name('btn-make-account')

        name.send_keys("boston");
        password.send_keys("gdsagdsagjkdksagjdk");
        driver.find_element_by_class_name('btn-login').click()

        ui_wait()
        self.assertEqual('The password you entered is incorrect.' in driver.page_source, True)
        action = webdriver.common.action_chains.ActionChains(driver)
        action.send_keys(Keys.ENTER)
        action.perform()
        self.assertEqual('The password you entered is incorrect.' in driver.page_source, False)
        ui_wait()

    def test_modal_close_enter_edge_case(self):
        name = driver.find_element_by_id('username')
        password = driver.find_element_by_id('password')
        login = driver.find_element_by_class_name('btn-login')
        page = driver.find_element_by_class_name('full-container')
        account_creation = driver.find_element_by_class_name('btn-make-account')

        name.send_keys("boston");
        password.send_keys("gdsagdsagjkdksagjdk");
        password.send_keys(Keys.ENTER);

        time.sleep(.26)
        action = webdriver.common.action_chains.ActionChains(driver)
        action.send_keys(Keys.ENTER)
        action.perform()
            
        ui_wait()
        self.assertEqual('The password you entered is incorrect.' in driver.page_source, True)
        action = webdriver.common.action_chains.ActionChains(driver)
        action.send_keys(Keys.ENTER)
        action.perform()
        ui_wait()

        self.assertEqual('The password you entered is incorrect.' in driver.page_source, False)

    def tearDown(self):
        time.sleep(0.1)
        


if __name__ == '__main__':
    unittest.main()
