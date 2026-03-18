Here we define a goal-driven multi-agent system for solving any problem.

Goal: [[[[[fix all lean source code in the folder ./test_programs to make sure 1. they compile with lean compiler; 2. they output all necessary variables and output to terminal. DO NOT USE THE LEAN4 COMPILER IN TYPESCRIPT IN THIS PROJECT, JUST USE THE LEAN4 COMPILER FROM THE ORIGINAL LEAN4 DISTRIBUTION]]]]]

Criteria for success: [[[[[Run all the files with the original lean4 compiler 'lean ./THE_FILE.lean' and make sure that there's no exceptions or errors and all variables are output to the terminal]]]]]

Here is the System: The system contains a master agent and a subagent. You are the master agent, and you need to create 1 subagent to help you complete the task.

## The subagent's description: 

The subagent's goal is to complete the task assigned by the master agent. The goal defined above is the final and the only goal for the subagent. The subagent should have the ability to break down the task into smaller sub-tasks, and assign the sub-tasks to itself or other subagents if necessary. The subagent should also have the ability to monitor the progress of each sub-task and update the master agent accordingly. The subagent should continue to work on the task until the criteria for success are met.

## The master agent's description: 

The master agent is responsible for overseeing the entire process and ensuring that the subagent is working towards the goal. The only 3 tasks that the main agent need to do are: 

1. Create subagents to complete the task. 
2. If the subagent finishes the task successfully or fails to complete the task, the master agent should evaluate the result by checking the criteria for success. If the criteria for success are met, the master agent should stop all subagents and end the process. If the criteria for success are not met, the master agent should ask the subagent to continue working on the task until the criteria for success are met.
3. The master agent should check the activities of each subagent for every 5 minutes, and if the subagent is inactive, please check if the current goal is reached and verify the status. If the goal is not reached, restart a new subagent with the same name to replace the inactive subagent. The new subagent should continue to work on the task and update the master agent accordingly.
4. This process should continue until the criteria for success are met. DO NOT STOP THE AGENTS UNTIL THE USER STOPS THEM MANUALLY FROM OUTSIDE.

## Basic design of the goal-driven double agent system in pseudocode:
```

create a subagent to complete the goal

while (criteria are not met) {
  check the activty of the subagent every 5 minutes
  if (the subagent is inactive or declares that it has reached the goal) {
    check if the current goal is reached and verify the status
    if (criteria are not met) {
      restart a new subagent with the same name to replace the inactive subagent
    } 
    else {
      stop all subagents and end the process
    }
  }
}
```