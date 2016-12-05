import unittest
import time

from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.keys import Keys

driver = webdriver.Chrome('/usr/bin/chromedriver')
driver.set_window_size(1000, 600)
driver.set_window_position(0, 0)

def ui_wait():
    time.sleep(0.4)
    

class TestDelete(unittest.TestCase):
    @classmethod
    def setUpClass(self):
        driver.get("http://localhost:4001/setup")
        driver.implicitly_wait(.5)

        name = driver.find_element_by_id('username')
        password = driver.find_element_by_id('password')
        weight = driver.find_element_by_id('weight')
        height = driver.find_element_by_id('height')
        age = driver.find_element_by_id('age')
        gender = driver.find_element_by_id('gender')
        goal = driver.find_element_by_id('goal')
        activity_level = driver.find_element_by_id('activity-level')


        name.send_keys("boston");
        password.send_keys("password1");
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

    def setUp(self):
        driver.implicitly_wait(.5)
        driver.get("http://localhost:4001/login")
        name = driver.find_element_by_id('username')
        password = driver.find_element_by_id('password')
        name.send_keys("boston");
        password.send_keys("password1");
        driver.find_element_by_class_name('btn-login').click()
        ui_wait()

    def test_accessable_on_entry(self):
        self.assertEqual('<a id="delete-button" href="delete"> Delete Your Account </a>' in driver.page_source, True)
        driver.find_element_by_id('delete-button').click()
        ui_wait()
        self.assertEqual('Account Deletion' in driver.page_source, True)

    def test_accessable_on_metrics(self):
        driver.find_element_by_id('metrics-button').click()
        ui_wait()
        self.assertEqual('<a id="delete-button" href="delete"> Delete Your Account </a>' in driver.page_source, True)
        driver.find_element_by_id('delete-button').click()
        ui_wait()
        self.assertEqual('Account Deletion' in driver.page_source, True)

    def test_navigate_back(self):
        driver.find_element_by_id('delete-button').click()
        ui_wait()
        driver.find_element_by_class_name('logo').click()
        ui_wait()
        self.assertEqual('Data Entry' in driver.page_source, True)

    def test_has_content(self):
        driver.find_element_by_id('delete-button').click()
        ui_wait()
        self.assertEqual('Account Deletion' in driver.page_source, True)
        self.assertEqual('Username' in driver.page_source, True)
        self.assertEqual('Password' in driver.page_source, True)
        self.assertEqual('logo' in driver.page_source, True)

    @classmethod
    def tearDownClass(self):
        driver.implicitly_wait(.5)
        driver.get("http://localhost:4001/login")
        name = driver.find_element_by_id('username')
        password = driver.find_element_by_id('password')
        name.send_keys("boston");
        password.send_keys("password1");
        driver.find_element_by_class_name('btn-login').click()
        ui_wait()
        driver.find_element_by_id('delete-button').click()
        ui_wait()
        name = driver.find_element_by_id('username')
        password = driver.find_element_by_id('password')
        name.send_keys("boston");
        password.send_keys("password1");
        driver.find_element_by_class_name('btn-login').click()
        print("Okay")

if __name__ == '__main__':
    unittest.main()
