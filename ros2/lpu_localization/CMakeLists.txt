cmake_minimum_required(VERSION 3.8)
project(lpu_localization)

if(CMAKE_COMPILER_IS_GNUCXX OR CMAKE_CXX_COMPILER_ID MATCHES "Clang")
  add_compile_options(-Wall -Wextra -Wpedantic)
endif()

find_package(ament_cmake REQUIRED)
find_package(rclcpp REQUIRED)
find_package(std_msgs REQUIRED)
find_package(geometry_msgs REQUIRED)

add_executable(lpu_node src/lpu_node.cpp)
ament_target_dependencies(lpu_node rclcpp std_msgs geometry_msgs)

install(TARGETS lpu_node DESTINATION lib/${PROJECT_NAME})
ament_package()
