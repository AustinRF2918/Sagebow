import unittest
import time

from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.keys import Keys

driver = webdriver.Chrome('/usr/bin/chromedriver')
driver.set_window_size(900, 900)
driver.set_window_position(0, 0)

def ui_wait():
    time.sleep(0.4)
    

class TestSetup(unittest.TestCase):
    def setUp(self):
        driver.get("http://localhost:4001/setup")
        driver.implicitly_wait(.5)

    def test_url(self):
        self.assertEqual('Welcome To Sagebow!' in driver.page_source, True)
        self.assertEqual('Sign Up' in driver.page_source, True)
        self.assertEqual('Username' in driver.page_source, True)
        self.assertEqual('Password' in driver.page_source, True)
        self.assertEqual('Gender' in driver.page_source, True)
        self.assertEqual('Goal' in driver.page_source, True)
        self.assertEqual('Activity Level' in driver.page_source, True)
        self.assertEqual('Weight' in driver.page_source, True)
        self.assertEqual('Height' in driver.page_source, True)
        self.assertEqual('Age' in driver.page_source, True)
        self.assertEqual('Create a new account.' in driver.page_source, True)

    def test_no_data(self):
        driver.find_element_by_class_name('btn-create').click()
        ui_wait()
        self.assertEqual('Oops' in driver.page_source, True)

    def test_transition_to_login(self):
        driver.find_element_by_class_name('logo').click()
        ui_wait()
        self.assertEqual('Welcome back to Sagebow.' in driver.page_source, True)

    def test_incomplete_signup(self):
        name = driver.find_element_by_id('username')
        password = driver.find_element_by_id('password')

        name.send_keys("bostonaa");
        password.send_keys("gdsagdsagjkdksagjdk");

        driver.find_element_by_class_name('btn-create').click()
        ui_wait()
        self.assertEqual('All fields are required.' in driver.page_source, True)

    def test_incomplete_signup(self):
        name = driver.find_element_by_id('username')
        password = driver.find_element_by_id('password')
        weight = driver.find_element_by_id('weight')
        height = driver.find_element_by_id('height')
        age = driver.find_element_by_id('age')

        name.send_keys("bostonaa");
        password.send_keys("gdsagdsagjkdksagjdk");
        weight.send_keys("22");
        height.send_keys("22");
        age.send_keys("22");

        driver.find_element_by_class_name('btn-create').click()
        ui_wait()
        self.assertEqual('All fields are required.' in driver.page_source, True)

    def test_complete_signup(self):
        name = driver.find_element_by_id('username')
        password = driver.find_element_by_id('password')
        weight = driver.find_element_by_id('weight')
        height = driver.find_element_by_id('height')
        age = driver.find_element_by_id('age')
        gender = driver.find_element_by_id('gender')
        goal = driver.find_element_by_id('goal')
        activity_level = driver.find_element_by_id('activity-level')


        name.send_keys("bostonaa");
        password.send_keys("jdskajdska");
        weight.send_keys("22");
        height.send_keys("22");
        age.send_keys("22");

        gender.click()
        ui_wait()
        action = webdriver.common.action_chains.ActionChains(driver)
        action.move_to_element_with_offset(gender, 33, 43) 
        action.click()
        ui_wait()
        action.perform()

        goal.click()
        ui_wait()
        action = webdriver.common.action_chains.ActionChains(driver)
        action.move_to_element_with_offset(goal, 33, 43) 
        action.click()
        ui_wait()
        action.perform()

        activity_level.click()
        ui_wait()
        action = webdriver.common.action_chains.ActionChains(driver)
        action.move_to_element_with_offset(activity_level, 33, 43) 
        action.click()
        ui_wait()
        action.perform()

        driver.find_element_by_class_name('btn-create').click()
        ui_wait()
        ui_wait()
        self.assertEqual('Nice' in driver.page_source, True)

    def test_modal_close_button(self):
        name = driver.find_element_by_id('username')
        password = driver.find_element_by_id('password')

        name.send_keys("boston");
        password.send_keys("gdsagdsagjkdksagjdk");

        driver.find_element_by_class_name('btn-create').click()
        ui_wait()
        self.assertEqual('All fields' in driver.page_source, True)

        driver.find_element_by_class_name('btn-reject').click()
        ui_wait()
        self.assertEqual('All fields' in driver.page_source, False)

    def test_modal_close_outside(self):
        name = driver.find_element_by_id('username')
        password = driver.find_element_by_id('password')

        name.send_keys("boston");
        password.send_keys("gdsagdsagjkdksagjdk");

        driver.find_element_by_class_name('btn-create').click()
        ui_wait()

        self.assertEqual('All fields' in driver.page_source, True)

        window = driver.find_element_by_class_name('window')
        action = webdriver.common.action_chains.ActionChains(driver)
        action.move_to_element_with_offset(window, -150, -150) 
        action.click()
        action.perform()
        ui_wait()

        self.assertEqual('All fields' in driver.page_source, False)

    def test_modal_not_close_inside(self):
        name = driver.find_element_by_id('username')
        password = driver.find_element_by_id('password')

        name.send_keys("boston");
        password.send_keys("gdsagdsagjkdksagjdk");

        driver.find_element_by_class_name('btn-create').click()
        ui_wait()

        self.assertEqual('All fields' in driver.page_source, True)

        window = driver.find_element_by_class_name('window')
        action = webdriver.common.action_chains.ActionChains(driver)
        action.move_to_element_with_offset(window, 20, 20) 
        action.click()
        action.perform()
        ui_wait()

        self.assertEqual('All fields' in driver.page_source, True)

    def test_modal_open_enter(self):
        name = driver.find_element_by_id('username')
        password = driver.find_element_by_id('password')
        login = driver.find_element_by_class_name('btn-create')
        page = driver.find_element_by_class_name('full-container')

        name.send_keys("boston");
        password.send_keys("gdsagdsagjkdksagjdk");

        password.send_keys(Keys.ENTER);
        ui_wait()
        self.assertEqual('All fields' in driver.page_source, True)
        driver.find_element_by_class_name('btn-reject').click()
        ui_wait()

        name.send_keys(Keys.ENTER);
        ui_wait()
        self.assertEqual('All fields' in driver.page_source, True)
        driver.find_element_by_class_name('btn-reject').click()
        ui_wait()

        login.send_keys(Keys.ENTER);
        ui_wait()
        self.assertEqual('All fields' in driver.page_source, True)
        driver.find_element_by_class_name('btn-reject').click()
        ui_wait()

    def test_modal_close_enter_from_enter(self):
        name = driver.find_element_by_id('username')
        password = driver.find_element_by_id('password')
        login = driver.find_element_by_class_name('btn-create')
        page = driver.find_element_by_class_name('full-container')

        name.send_keys("boston");
        password.send_keys("gdsagdsagjkdksagjdk");
        password.send_keys(Keys.ENTER);

        ui_wait()
        self.assertEqual('All fields' in driver.page_source, True)
        action = webdriver.common.action_chains.ActionChains(driver)
        action.send_keys(Keys.ENTER)
        action.perform()
        self.assertEqual('All fields' in driver.page_source, False)
        ui_wait()

    def test_modal_close_enter_from_click(self):
        name = driver.find_element_by_id('username')
        password = driver.find_element_by_id('password')
        login = driver.find_element_by_class_name('btn-create')
        page = driver.find_element_by_class_name('full-container')

        name.send_keys("boston");
        password.send_keys("gdsagdsagjkdksagjdk");
        login.click()

        ui_wait()
        self.assertEqual('All fields' in driver.page_source, True)
        action = webdriver.common.action_chains.ActionChains(driver)
        action.send_keys(Keys.ENTER)
        action.perform()
        self.assertEqual('All fields' in driver.page_source, False)
        ui_wait()

    def test_modal_close_enter_edge_case(self):
        name = driver.find_element_by_id('username')
        password = driver.find_element_by_id('password')
        login = driver.find_element_by_class_name('btn-create')
        page = driver.find_element_by_class_name('full-container')

        name.send_keys("boston");
        password.send_keys("gdsagdsagjkdksagjdk");
        password.send_keys(Keys.ENTER);

        time.sleep(.26)
        action = webdriver.common.action_chains.ActionChains(driver)
        action.send_keys(Keys.ENTER)
        action.perform()
            
        ui_wait()
        self.assertEqual('All fields' in driver.page_source, False)
        action = webdriver.common.action_chains.ActionChains(driver)
        action.send_keys(Keys.ENTER)
        action.perform()
        ui_wait()

        self.assertEqual('All fields' in driver.page_source, True)

    def tearDown(self):
        time.sleep(0.1)
        


if __name__ == '__main__':
    unittest.main()
