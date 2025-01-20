package com.dariotintore.tesi.exerciseservice.Service;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

@Service
public class FileService { 

	public List<String> getAllFiles() {
	    return Stream.of(new File("ExerciseDB/").listFiles())
	    .filter(file -> file.isDirectory())
	    .map(File::getName)
	    .collect(Collectors.toList());
	}

	public byte[] getFile(String exercise, String type) throws IOException {
	    byte [] response = null;
	    if(type.equals("Production")){
	        response = Files.readAllBytes(Paths.get("ExerciseDB/" + exercise +  "/"+ exercise + ".java"));
	    }
	    else if(type.equals("Test")){
	        response = Files.readAllBytes(Paths.get("ExerciseDB/" + exercise +  "/"+ exercise + "Test.java"));
	    }
	    else if(type.equals("Configuration")){
	        response = Files.readAllBytes(Paths.get("ExerciseDB/" + exercise + "/" + exercise + "Config.json"));
	    }
	    return response;
	}

	public List<byte[]> getAllConfigFiles() throws IOException {
		List<byte[]> configFiles = new ArrayList<>();
		List<String> exercises = getAllFiles();

		for (String exercise : exercises) {
			byte[] configFile = Files.readAllBytes(Paths.get("ExerciseDB/" + exercise + "/" + exercise + "Config.json"));
			configFiles.add(configFile);
		}

		return configFiles;
    }



	public List<Map<String, Object>> getExercisesConfigByLevel(int level) throws IOException {
		List<Map<String, Object>> matchingConfigs = new ArrayList<>();
		List<String> exercises = getAllFiles();
		ObjectMapper mapper = new ObjectMapper();

		for (String exercise : exercises) {
			try {
				String configPath = "ExerciseDB/" + exercise + "/" + exercise + "Config.json";

				byte[] configFileBytes = Files.readAllBytes(Paths.get(configPath));
				String configFileContent = new String(configFileBytes);

				// mappa generica per i campi
				Map<String, Object> configMap = mapper.readValue(configFileContent, new TypeReference<Map<String, Object>>() {});

				Map<String, Object> refactoringGameConfig = (Map<String, Object>) configMap.get("refactoring_game_configuration");
				if (refactoringGameConfig != null && (int) refactoringGameConfig.get("level") == level) {
					matchingConfigs.add(configMap);
				}
			} catch (FileNotFoundException e) {
				System.err.println("File di configurazione non trovato per: " + exercise);
			} catch (IOException e) {
				System.err.println("Errore nella lettura del file per: " + exercise);
				e.printStackTrace();
			}
		}
		return matchingConfigs;
	}



	@JsonIgnoreProperties(ignoreUnknown = true)
	public static class ExerciseConfig {
		private String exerciseId;

		@JsonProperty("refactoring_game_configuration")
		private RefactoringGameConfiguration refactoringGameConfiguration;


		public String getExerciseId() {
			return exerciseId;
		}

		public void setExerciseId(String exerciseId) {
			this.exerciseId = exerciseId;
		}

		public RefactoringGameConfiguration getRefactoringGameConfiguration() {
			return refactoringGameConfiguration;
		}

		public void setRefactoringGameConfiguration(RefactoringGameConfiguration refactoringGameConfiguration) {
			this.refactoringGameConfiguration = refactoringGameConfiguration;
		}

		@JsonIgnoreProperties(ignoreUnknown = true)
		public static class RefactoringGameConfiguration {
			private int level;

			public int getLevel() {
				return level;
			}

			public void setLevel(int level) {
				this.level = level;
			}
		}


	}


}
