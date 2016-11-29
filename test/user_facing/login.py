import unittest
import time

from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

driver = webdriver.Chrome('/usr/bin/chromedriver')
driver.set_window_size(1120, 1120)

class TestIntroduction(unittest.TestCase):
    def setUp(self):
        driver.implicitly_wait(1)

    def test_url(self):
        driver.get("http://localhost:4001/login")
        self.assertEqual('Welcome back to Sagebow.' in driver.page_source, True)
        self.assertEqual('Enter your username' in driver.page_source, True)
        self.assertEqual('Enter your password' in driver.page_source, True)
        self.assertEqual('Login' in driver.page_source, True)
        self.assertEqual('Create a new account' in driver.page_source, True)

    def test_no_data(self):
        driver.get("http://localhost:4001/login")
        driver.find_element_by_class_name('btn-login').click()
        self.assertEqual('Oops' in driver.page_source, True)

    def test_transition_to_setup(self):
        driver.get("http://localhost:4001/login")
        driver.find_element_by_class_name('btn-make-account').click()
        self.assertEqual('Sign Up' in driver.page_source, True)

    def test_bad_login(self):
        driver.get("http://localhost:4001/login")
        name = driver.find_element_by_id('username')
        password = driver.find_element_by_id('password')

        name.send_keys("gdsagdsagjkdksagjdk");
        password.send_keys("gdsagdsagjkdksagjdk");

        driver.find_element_by_class_name('btn-login').click()
        self.assertEqual('This username does not exist.' in driver.page_source, True)

    def test_bad_password(self):
        driver.get("http://localhost:4001/login")
        name = driver.find_element_by_id('username')
        password = driver.find_element_by_id('password')

        name.send_keys("boston");
        password.send_keys("gdsagdsagjkdksagjdk");

        driver.find_element_by_class_name('btn-login').click()
        time.sleep(0.5)
        self.assertEqual('The password you entered is incorrect.' in driver.page_source, True)

    def test_good_password(self):
        driver.get("http://localhost:4001/login")
        name = driver.find_element_by_id('username')
        password = driver.find_element_by_id('password')

        name.send_keys("boston");
        password.send_keys("password1");

        driver.find_element_by_class_name('btn-login').click()
        time.sleep(0.5)
        self.assertEqual('Entry' in driver.page_source, True)
        driver.find_element_by_id('logout-button').click()

    def test_modal_close_button(self):
        driver.get("http://localhost:4001/login")
        name = driver.find_element_by_id('username')
        password = driver.find_element_by_id('password')

        name.send_keys("boston");
        password.send_keys("gdsagdsagjkdksagjdk");

        driver.find_element_by_class_name('btn-login').click()
        time.sleep(0.5)
        self.assertEqual('The password you entered is incorrect.' in driver.page_source, True)

        driver.find_element_by_class_name('btn-reject').click()
        time.sleep(0.5)
        self.assertEqual('The password you entered is incorrect.' in driver.page_source, False)

    def test_modal_close_outside(self):
        driver.get("http://localhost:4001/login")
        name = driver.find_element_by_id('username')
        password = driver.find_element_by_id('password')

        name.send_keys("boston");
        password.send_keys("gdsagdsagjkdksagjdk");

        driver.find_element_by_class_name('btn-login').click()
        time.sleep(0.8)

        self.assertEqual('The password you entered is incorrect.' in driver.page_source, True)

        window = driver.find_element_by_class_name('window')
        action = webdriver.common.action_chains.ActionChains(driver)
        action.move_to_element_with_offset(window, -150, -150) 
        action.click()
        action.perform()

        time.sleep(0.8)

        self.assertEqual('Oops' in driver.page_source, False)

    def test_modal_not_close_inside(self):
        driver.get("http://localhost:4001/login")
        name = driver.find_element_by_id('username')
        password = driver.find_element_by_id('password')

        name.send_keys("boston");
        password.send_keys("gdsagdsagjkdksagjdk");

        driver.find_element_by_class_name('btn-login').click()
        time.sleep(0.8)

        self.assertEqual('The password you entered is incorrect.' in driver.page_source, True)

        window = driver.find_element_by_class_name('window')
        action = webdriver.common.action_chains.ActionChains(driver)
        action.move_to_element_with_offset(window, 150, 150) 
        action.click()
        action.perform()

        time.sleep(0.8)

        self.assertEqual('Oops' in driver.page_source, True)

    
    def tearDown(self):
        driver.get("http://localhost:4001/login")
        


if __name__ == '__main__':
    unittest.main()
